const accountSid = 'ACc0426ce203735e88851ee7ef31020fd1';
const authToken = 'c29db3059472d423f9371d44f828755b';
const myNumber = '+12095632969';

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