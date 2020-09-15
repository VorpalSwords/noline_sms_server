# noline_sms_server
noline_sms_server

Heroku server Stop/Start:   
heroku ps:scale web=0  
heroku ps:scale web=1

Heroku logs:  
heroku logs --tail  
  

  
Twilio Setup:  
twilio phone-numbers:update "PHONENUMBER" --sms-url="https://noline-sms-server.herokuapp.com/sms" --voice-url="https://noline-sms-server.herokuapp.com/voice"