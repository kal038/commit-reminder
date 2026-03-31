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
            subject: "A commit a day - keeps skill issues away",
            text: message
        })
    } catch (error) {
        console.error("Failed to send email:", error)
    }
}

async function main() {
    try {
        const username = process.env.GITHUB_USERNAME
        const github_res = await fetch(`https://api.github.com/users/${username}/events`)
        
        if (!github_res.ok) {
            throw new Error(`Github API error: ${github_res.status}`)
        }

        sendEmail("test")
        const github_data = await github_res.json()
        //console.log(github_data)
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        
        const hasGithubCommit = Array.isArray(github_data) && github_data.some(event => 
            new Date(event.created_at) > oneDayAgo && event.type === "PushEvent"
        )
        
        // Note: LeetCode API check usually requires GraphQL or a specific session.
        // This is a simplified check or placeholder logic.
        // const leetcode_res = await fetch(`https://leetcode.com/api/problemset/all/`)
        // const leetcode_data = await leetcode_res.json()
        // const hasLeetcodeCommit = leetcode_data && leetcode_data.num_total > 0

        if (!hasGithubCommit) {
            console.log("You missed your Github commit today! Go commit now!")
            // await sendEmail("You missed your Github commit today! Go commit now!")
        } else {
            console.log("You did great with Github today! Keep it up!")
        }

        // if (!hasLeetcodeCommit) {
        //     console.log("You missed your LeetCode goal today!")
        // }

    } catch (error) {
        console.error("Error in commit reminder:", error.message)
    }
}

main()