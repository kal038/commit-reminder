import dotenv from "dotenv"
import nodemailer from "nodemailer"
dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

async function sendEmail(message) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.TARGET_EMAIL,
            subject: "A commit a day :)",
            text: message
        })
    } catch (error) {
        console.error("Failed to send email:", error)
    }
}

async function main() {
    try {
        const username = process.env.GH_USERNAME
        const github_res = await fetch(`https://api.github.com/users/${username}/events`)
        
        if (!github_res.ok) {
            throw new Error(`Github API error: ${github_res.status}`)
        }

        const github_data = await github_res.json()
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        
        const hasGithubCommit = Array.isArray(github_data) && github_data.some(event => 
            new Date(event.created_at) > oneDayAgo && event.type === "PushEvent"
        )

        if (!hasGithubCommit) {
            console.log("You missed your Github commit today! Go commit now!")
            await sendEmail("You missed your Github commit today! Go commit now!")
        } else {
            console.log("You did great with Github today! Keep it up!")
        }

    } catch (error) {
        console.error("Error in commit reminder:", error.message)
    }
}

main()