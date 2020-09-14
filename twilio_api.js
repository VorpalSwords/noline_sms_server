const accountSid = 'ACbc2f6ad9d9e8946260b7378863b2181b';
const authToken = 'fc3f932bcf27102ab5c92f7c6e812cb0';
const myNumber = '+17207306218';

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const SendSms = async (toNumber, text) => {
    console.log(toNumber, text);
    try {
        let message = await client.messages.create({
            body: text, 
            from: myNumber, 
            to: toNumber
        });
        if (!message) {
            console.log("Error creating SMS: Empty");
        }
        console.log(message.sid);
    } catch (error) {
        console.log("Error creating SMS: " + error);
    }
};

const LogReceievedSms = (req, res) => {
    console.log("Received SMS From " + req.body.From + " : " + req.body.Body);
};

const ReponseToSms = (req, res, responseMessage) => {
    const twiml = new MessagingResponse();
    twiml.message(responseMessage);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
};

const LogIncomingCall = (req, res) => {
    console.log("Received Call From " + req.body.From);
};

const ResponseToIncomingCall = (req, res) => {
    const twiml = new VoiceResponse();
    twiml.say({ voice: 'alice' }, 'Hello, this is mister razuchka');
    res.type('text/xml');
    res.send(twiml.toString());
};

exports.SendSms = SendSms;
exports.LogReceievedSms = LogReceievedSms;
exports.ReponseToSms = ReponseToSms;
exports.LogIncomingCall = LogIncomingCall;
exports.ResponseToIncomingCall = ResponseToIncomingCall;