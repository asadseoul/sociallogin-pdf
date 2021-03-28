import React,{Component} from 'react';
import './App.css';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import {Progress} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShareLink from 'react-facebook-share-link'
 
const BACKEND_URL = "http://localhost:8000";


class App extends Component {

  constructor(props) {
    super(props);
      this.state = {
        selectedFile: null,
        loaded:0,
        tableRecord : [],
        data : null,
        searchedPdfUrl : null,
        availability : "no",
        availabilityMessage : null,
        enable : false,
        loading : false
      }
      this.handleKeyUpPdfFileText = this.handleKeyUpPdfFileText.bind(this); 
      this.handleKeyUpPdfFileName = this.handleKeyUpPdfFileName.bind(this);  
  }

  checkFileSize=(event)=>{
    let files = event.target.files
    let size = 2000000 
    let err = []; 
    for(var x = 0; x<files.length; x++) {
      if (files[x].size > size) {
        err[x] = files[x].type+'is too large, please pick a smaller file\n';
      }
    };
  
    for(var z = 0; z<err.length; z++) {// if message not same old that mean has error 
      // discard selected file
      toast.error(err[z])
      event.target.value = null
    }
    return true;
  }
  
  onChangeHandler=event=>{
    var files = event.target.files
    if(this.checkFileSize(event)){ 
       this.setState({
         selectedFile: files,
         loaded:0,
         enable : true
       })
    }
  }
    onClickHandler = (event) => {
      event.preventDefault();
      var userInfo = {
        'name': this.state.data.username,
        'userid':this.state.data.attributes.email
      }
      //return console.log(userInfo)
      const data = new FormData() 
      for(var x = 0; x<this.state.selectedFile.length; x++) {
        data.append('file', this.state.selectedFile[x])
        data.append('userdetails', JSON.stringify(userInfo))
      }
      axios.post(BACKEND_URL+"/upload", data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
          })
        },
      })
        .then(res => { // then print response status
          toast.success('upload success')
          this.loadData();
          this.setState({
            enable : false,
            loaded : 0
          });
        })
        .catch(err => { // then print response status
          toast.error('upload fail')
        })
    }


    ondeleteHandler = async (id,path) =>{
      var payload = {
        "id" : id,
        "path" : path
      }
      var deleteData = await axios.delete(BACKEND_URL+'/delete-record-by-id',{ data: payload });
      if(deleteData){
        toast.success('record deleted')
        this.loadData();
      }
    } 
  
    componentDidMount()
    {
      this.login();  
      console.log(this.state.loading);
    }


    loadData = async () =>
    {
      var resultSet = await axios.get(BACKEND_URL+'/get-record');
      console.log(resultSet)
      this.setState({
        tableRecord : resultSet.data.result,
        loading : false
      });
    } 


    handleKeyUpPdfFileName = async (event) => {
      if (event.key === 'Enter') {
        console.log(event.target.value);
         var data = await axios.post(BACKEND_URL+'/get-record-file-name',{"filename" : event.target.value});
         if(data.data.statusCode === 200){
           this.setState(
             {
               searchedPdfUrl : BACKEND_URL+"/my-virtual-directory/"+data.data.result.fileInfo.filename,
               availability : "yes",
               availabilityMessage : null
             }
           );
          }
          else
          {
            this.setState(
              {
                searchedPdfUrl : "",
                availability : "no",
                availabilityMessage : "No record found!!"
              }
            );
          }
      }
      
    }

    handleKeyUpPdfFileText = async (event) => {
      
      if (event.key === 'Enter') {
        console.log(event.target.value);
        var data = await axios.post(BACKEND_URL+'/get-record-file-inner-text',{searchString : event.target.value});
        console.log(data.data.result);
        this.setState({
          tableRecord : data.data.result
        });
      }
      else
      {
        if(event.target.value == '')
        {
          this.loadData();
        }
      }
      
    }





  async login(){
    try
    {
     var data = await Auth.currentAuthenticatedUser();

     if(data){      
       this.setState({
         data : data,
         loading : true
       });
       
       setTimeout(() => {
         this.loadData(); 
       }, 2000);
       
     }      
    }
    catch(error)
    {
      this.setState({
        "notAuthorize" : "Please login to continue!"
      });
    }

  }

  render()
  {
    const {tableRecord,availability,searchedPdfUrl,availabilityMessage,enable,loading} = this.state;
    return (
      
      <div className="container" style={{"marginTop": "50px"}}>
       
        {!this.state.data &&
          <React.Fragment>
            <div className="container">
              <div style={{"textAlign" : "center"}}>{this.state.notAuthorize}</div>
            </div>
            <div>
              <button style={{marginBottom : "10px"}} className="btn btn-success form-control" onClick={() => { Auth.federatedSignIn({ "provider": "Google" }) }}>Gmail Login</button>
              <button  style={{marginBottom : "10px"}} className="btn btn-warning form-control" onClick={() => { Auth.federatedSignIn({ "provider": "Facebook" }) }}>Facebook Login</button>
              <button  style={{marginBottom : "10px"}} className="btn btn-danger form-control" onClick={() => { Auth.federatedSignIn() }}>Social Login</button>
            </div>
            
            
             
          </React.Fragment>
        }
        {
        this.state.data && 
         <React.Fragment>
            <div style={{marginBottom : "20px", float : "right", color : "RED"}}>
               <span> User logged in. Email: {this.state.data.attributes.email}</span>
               <button className="btn btn-danger" style={{marginLeft : "20px"}} onClick={()=>Auth.signOut()} >Logout</button>
             </div>

              
               <div >
                 <br></br>
                <strong>Upload Your File (.pdf*)</strong>
                <input type="file" style={{marginLeft : 10}} className="btn btn-warning"  accept=".pdf" onChange={this.onChangeHandler}/>
                {enable && <button style={{marginLeft : 10}} className="btn btn-success" type="button" onClick={this.onClickHandler}>Upload</button>}
              </div>  
              <div className="form-group">
                <br></br>
              <ToastContainer />
              <Progress max="100" color="success" value={this.state.loaded} >{Math.round(this.state.loaded,2) }%</Progress>
              </div> 
              
              

             
              <div style={{marginBottom:"10px"}}><strong>Search by pdf name : </strong><input placeholder="Ex. Asad-resume.pdf" onKeyUp={this.handleKeyUpPdfFileName}/> { availability ==='yes' ? <a href={searchedPdfUrl} target="_blank">View Pdf</a> : availabilityMessage }  Note : Please give exact file name and then press enter to search!</div>
              <div  style={{marginBottom:"10px"}}><strong>Search by pdf text  :&nbsp;&nbsp;&nbsp; </strong><input placeholder="Ex. Hello" onKeyUp={this.handleKeyUpPdfFileText}/> Note : After typing, press enter to search!</div>  

              <div style={{"textAlign" : "center"}}>
                { loading === true  ? <img align="center" src="./loading.gif" style={{"height" : "100px"}} /> : null }
              </div>


              <label>{ tableRecord.length > 0 && <div>Showing all ({tableRecord.length}) records </div> } </label>  
              <label>{ tableRecord.length === 0 && <div>No records found!</div> } </label>
              
              { 
                
                tableRecord && tableRecord.map(single =>(
                  
                    <div key={single.id}> 
                      <div key={`headline_${single.id}`} style={{marginBottom:"20px"}} >
                        <strong>Username:</strong>{JSON.parse(single.userDetail).name} 
                        <strong> &nbsp;&nbsp;/ &nbsp;&nbsp;</strong>
                        <strong>Email</strong> {JSON.parse(single.userDetail).userid} 
                        <ShareLink link={`${BACKEND_URL}/my-virtual-directory/${single.fileInfo.filename}`}>
                          {link => (
                              <a class ="btn btn-warning" style={{marginLeft:"20px"}} href={link} target='_blank'>Share on Facebook</a>
                          )}
                        </ShareLink>
                        <a key={`view_${single.id}`} style={{color : "BLUE",float : "right", cursor : "pointer"}}  target="_blank" href= {`${BACKEND_URL}/my-virtual-directory/${single.fileInfo.filename}`} >[ View Pdf ]</a>
                        <strong key={`del_${single.id}`} style={{color : "RED",float : "right", cursor : "pointer"}}  onClick={()=>this.ondeleteHandler(single._id,single.fileInfo.path)} >[ Delete ]</strong>
                        
                      </div>
                      
                      <p key={`firstpageContent_${single.id}`}>{single.firstPage}</p> 

                    </div>
                  
                ))
              }
            
             
         </React.Fragment>
         
        }
      </div>
    );
  }
}

export default App;
