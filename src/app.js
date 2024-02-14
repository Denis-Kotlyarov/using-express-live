require('dotenv').config()
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')

const express = require('express')
const path = require('path')
const JOBS = require('./jobs')
const mustacheExpress = require('mustache-express')
const app = express()

app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'pages'))
app.set('view engine', 'mustache')
app.engine('mustache', mustacheExpress())

app.get('/', (req, res) => {
    // res.send('Hello Den')
    // res.sendFile(path.join(__dirname, 'pages/index.html'))
    res.render('index', { jobs: JOBS })
})

app.get('/jobs/:id', (req, res) => {
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id)
    res.render('job', {job: matchedJob})
})

/*app.post('/jobs/:id/apply', (req, res) => {
    res.send("Got the application")
})*/

const transporter = nodemailer.createTransport({
    host: 'mail.gmx.com', //SMTP Host your mail provider
    port: 465, //SMTP Port
    secure: true,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
})

app.post('/jobs/:id/apply', (req, res) => {
    const {name, email, message} = req.body

    const id = req.params.id
    const matchedJob = JOBS.find(job => job.id.toString() === id)

    res.send('Recived')

    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: process.env.EMAIL_ID,
        subject: `New app for ${matchedJob.title}`,

        html: `
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
        `
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error)
            res.status(500).send('Error sending mail')
        } else {
            console.log("Email sent: " + info.response)
            res.status(200).send('Email sent successfully')
        }
    })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`)
})