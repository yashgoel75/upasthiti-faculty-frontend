import redis from '@/lib/redis';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    const email = "upasthiti.erp@gmail.com";

    try {
        const { data } = await resend.emails.send({
            from: "Upasthiti <noreply@cleit.in>",
            to: email,
            subject: "Critical Attendance - VIPS",
            html: `
            <div style="background-color: #f4f4f7; padding: 20px; font-family: Arial, sans-serif;">
    <div style="margin: auto; background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        

        <h1 style="color: #333; text-align: center;">Attendance Update</h1>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Dear <strong>Mr. Sanjeev Goel</strong>,
            <br><br>
            This is to inform you regarding the attendance record of your ward, 
            <strong>Yash Goel</strong>, a student of <strong>AIML-B, B.Tech</strong> at 
            <strong>Vivekananda Institute of Professional Studies</strong>.
        </p>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
            His current attendance for <strong>Semester 5</strong> stands at:
        </p>

        <div style="text-align: center; margin: 25px 0;">
            <span style="display: inline-block; background-color: #fff4f4; color: #dc2626; font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 12px 24px; border-radius: 6px;">
                67%
            </span>
        </div>

        <p style="color: #555; font-size: 16px; line-height: 1.5;">
            As this is below the minimum attendance requirement, we request your attention to ensure timely improvement.
        </p>

        <p style="color: #333; font-size: 14px; margin-top: 30px;">
            Warm regards,<br>
            Team Upasthiti
        </p>
    </div>
</div>

`
            ,
        });

        return NextResponse.json(
            { message: "Email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}