import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendSupervisionRequestNotification(
    to: string[],
    projectName: string,
    status: 'approved' | 'rejected',
    doctorName: string,
  ) {
    const subject =
      status === 'approved'
        ? `تم قبول طلب الإشراف على مشروع ${projectName}`
        : `تم رفض طلب الإشراف على مشروع ${projectName}`;

    const html =
      status === 'approved'
        ? `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>مبروك! تم قبول طلب الإشراف</h2>
          <p>عزيزي الطالب،</p>
          <p>نود إبلاغك بأن الدكتور <strong>${doctorName}</strong> قد وافق على الإشراف على مشروعكم:</p>
          <h3>${projectName}</h3>
          <p>يمكنك الآن البدء في العمل على المشروع والتواصل مع الدكتور المشرف.</p>
          <p>بالتوفيق!</p>
        </div>
      `
        : `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>إشعار برفض طلب الإشراف</h2>
          <p>عزيزي الطالب،</p>
          <p>نأسف لإبلاغك بأن الدكتور <strong>${doctorName}</strong> قد اعتذر عن الإشراف على مشروع:</p>
          <h3>${projectName}</h3>
          <p>يمكنك التقديم على مشروع آخر أو التواصل مع دكتور آخر.</p>
        </div>
      `;

    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: to.join(','),
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
