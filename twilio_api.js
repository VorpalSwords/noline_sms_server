const accountSid = 'ACbc2f6ad9d9e8946260b7378863b2181b';
const authToken = 'fc3f932bcf27102ab5c92f7c6e812cb0';
const myNumber = '+17207306218';

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const SendSms = async (toNumber, text) => {
    try {
        let message = await client.messages.create({
            body: text, 
            from: myNumber, 
            to: toNumber
        });
        if (!message) {
            console.log("Error creating SMS: Empty");
        }
        console.log("Sent SMS to: ", toNumber, " text: ", text, " id ", message.sid);
    } catch (error) {
        console.log("Error creating SMS: " + error);
    }
};

const LogReceievedSms = (req, res) => {
    console.log("Received SMS From " + req.body.From + " : " + req.body.Body);
};

const ReponseToSms = (req, res, responseSmsMessage) => {
    if (responseSmsMessage) {
        SendSms(req.body.From, responseSmsMessage);
    }
};

const LogIncomingCall = (req, res) => {
    console.log("Received Call From " + req.body.From);
};

const ResponseToIncomingCall = (req, res, followupSmsMessage) => {
    const twiml = new VoiceResponse();
    twiml.say({ voice: 'alice' }, 'Hello, you will receive SMS with noline registeration link in just a second.');
    res.type('text/xml');
    res.send(twiml.toString());

    if (followupSmsMessage) {
        SendSms(req.body.From, followupSmsMessage);
    }
};

exports.SendSms = SendSms;
exports.LogReceievedSms = LogReceievedSms;
exports.ReponseToSms = ReponseToSms;
exports.LogIncomingCall = LogIncomingCall;
exports.ResponseToIncomingCall = ResponseToIncomingCall;