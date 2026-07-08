import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private getEmailTemplate(
    title: string,
    message: string,
    code: string,
    expiryMinutes: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      مشروع التخرج
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                      منصة التعليم الإلكتروني
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px; font-weight: 600;">
                      ${title}
                    </h2>
                    <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                      ${message}
                    </p>

                    <div style="background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%); border-radius: 15px; padding: 30px; text-align: center; border: 2px dashed #cbd5e0; margin: 30px 0;">
                      <p style="margin: 0 0 15px 0; color: #718096; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                        كود التحقق
                      </p>
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; padding: 20px; border-radius: 10px; display: inline-block; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);">
                        ${code}
                      </div>
                    </div>

                    <div style="background: #fff5f5; border-right: 4px solid #f56565; padding: 20px; border-radius: 10px; margin: 30px 0;">
                      <p style="margin: 0; color: #742a2a; font-size: 14px; line-height: 1.6;">
                        <strong>⏰ مهم:</strong> هذا الكود صالح لمدة <strong>${expiryMinutes} دقائق</strong> فقط
                      </p>
                    </div>

                    <div style="background: #f7fafc; border-radius: 10px; padding: 25px; margin: 30px 0;">
                      <p style="margin: 0 0 15px 0; color: #2d3748; font-size: 15px; font-weight: 600;">
                        💡 نصائح الأمان:
                      </p>
                      <ul style="margin: 0; padding: 0 0 0 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                        <li style="margin-bottom: 8px;">لا تشارك هذا الكود مع أي شخص</li>
                        <li style="margin-bottom: 8px;">فريقنا لن يطلب منك هذا الكود أبداً</li>
                        <li style="margin-bottom: 8px;">إذا لم تطلب هذا الكود، يرجى تجاهل هذه الرسالة</li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="background: #f7fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 15px 0; color: #718096; font-size: 14px; text-align: center;">
                      هل تحتاج إلى مساعدة؟
                    </p>
                    <p style="margin: 0; text-align: center;">
                      <a href="mailto:${process.env.EMAIL_USER}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                        تواصل معنا
                      </a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background: #2d3748; padding: 25px 40px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #a0aec0; font-size: 13px;">
                      © ${new Date().getFullYear()} مشروع التخرج. جميع الحقوق محفوظة
                    </p>
                    <div style="margin-top: 15px;">
                      <a href="#" style="display: inline-block; margin: 0 10px; color: #a0aec0; text-decoration: none; font-size: 12px;">
                        الشروط والأحكام
                      </a>
                      <span style="color: #4a5568;">•</span>
                      <a href="#" style="display: inline-block; margin: 0 10px; color: #a0aec0; text-decoration: none; font-size: 12px;">
                        سياسة الخصوصية
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(email: string, code: string) {
    const html = this.getEmailTemplate(
      'تأكيد البريد الإلكتروني',
      'شكراً لتسجيلك معنا! للمتابعة، يرجى استخدام كود التحقق التالي لتفعيل حسابك:',
      code,
      10,
    );

    try {
      await this.transporter.sendMail({
        from: `"مشروع التخرج" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 كود تأكيد البريد الإلكتروني',
        html,
      });
    } catch (error) {
      throw new InternalServerErrorException('فشل إرسال البريد الإلكتروني');
    }
  }

  async sendResetPasswordEmail(email: string, code: string) {
    const html = this.getEmailTemplate(
      'إعادة تعيين كلمة المرور',
      'تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. استخدم الكود التالي لإتمام العملية:',
      code,
      10,
    );

    try {
      await this.transporter.sendMail({
        from: `"مشروع التخرج" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔑 إعادة تعيين كلمة المرور',
        html,
      });
    } catch (error) {
      throw new InternalServerErrorException('فشل إرسال البريد الإلكتروني');
    }
  }
}
