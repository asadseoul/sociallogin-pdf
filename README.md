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
  # This will deploy frntend to aws

# To start react appliaction : npm start 
# To start node server : node server.js 





