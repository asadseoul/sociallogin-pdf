Instruction:

npx create-react-app codetest

cd codetest

npm install

# I'm using aws cognito for social login
# to configure amplify project - following commands are important
  
  npm install -g @aws-amplify/cli
  
  amplify configure
  
  amplify init  
  
  amplify add auth [select federal] 

# for deployment in aws  
  amplify push 
  
  This will deploy frontend to aws

# Run in Local machine only : 
  1. Git clone project
  2. cd directory
  3. npm install

  To start node server : 
  4. node server.js 

  To start react appliaction : 
  5. npm start 
  






