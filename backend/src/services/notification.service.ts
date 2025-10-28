import nodemailer from 'nodemailer';
import { StudentAccount } from '../entities/StudentAccount';
import { BorrowTransaction } from '../entities/BorrowTransaction';
import { TransactionStatus } from '../../../shared/src/types';
import { twilioClient } from '../config/twilio';

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendSMS(to: string, message: string): Promise<void> {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  // Notification templates
  async sendBorrowConfirmation(
    student: StudentAccount,
    transaction: BorrowTransaction
  ): Promise<void> {
    const subject = 'Kit Borrowed Successfully';
    const text = `Hello ${student.firstName},\n\n` +
      `You have successfully borrowed kit ${transaction.kit.name}.\n` +
      `Due date: ${transaction.dueDate.toLocaleDateString()}\n\n` +
      `Please ensure to return the kit in good condition by the due date.\n\n` +
      `Best regards,\nLibrary Kit Management System`;

    await this.sendEmail(student.email, subject, text);

    if (student.phone) {
      const smsText = `Kit ${transaction.kit.name} borrowed. Due: ${transaction.dueDate.toLocaleDateString()}`;
      await this.sendSMS(student.phone, smsText);
    }
  }

  async sendReturnConfirmation(
    student: StudentAccount,
    transaction: BorrowTransaction
  ): Promise<void> {
    const subject = 'Kit Returned Successfully';
    const text = `Hello ${student.firstName},\n\n` +
      `You have successfully returned kit ${transaction.kit.name}.\n` +
      `Return date: ${transaction.returnDate?.toLocaleDateString()}\n\n` +
      `Thank you for using our services.\n\n` +
      `Best regards,\nLibrary Kit Management System`;

    await this.sendEmail(student.email, subject, text);
  }

  async sendDueReminder(
    student: StudentAccount,
    transaction: BorrowTransaction
  ): Promise<void> {
    const subject = 'Kit Due Soon Reminder';
    const text = `Hello ${student.firstName},\n\n` +
      `This is a reminder that kit ${transaction.kit.name} is due on ${transaction.dueDate.toLocaleDateString()}.\n` +
      `Please ensure to return it on time to avoid any penalties.\n\n` +
      `Best regards,\nLibrary Kit Management System`;

    await this.sendEmail(student.email, subject, text);

    if (student.phone) {
      const smsText = `Reminder: Kit ${transaction.kit.name} is due on ${transaction.dueDate.toLocaleDateString()}`;
      await this.sendSMS(student.phone, smsText);
    }
  }

  async sendOverdueNotification(
    student: StudentAccount,
    transaction: BorrowTransaction
  ): Promise<void> {
    const subject = 'Kit Overdue Notice';
    const text = `Hello ${student.firstName},\n\n` +
      `Kit ${transaction.kit.name} is now overdue.\n` +
      `Original due date: ${transaction.dueDate.toLocaleDateString()}\n\n` +
      `Please return the kit as soon as possible to avoid additional penalties.\n\n` +
      `Best regards,\nLibrary Kit Management System`;

    await this.sendEmail(student.email, subject, text);

    if (student.phone) {
      const smsText = `OVERDUE: Kit ${transaction.kit.name} was due on ${transaction.dueDate.toLocaleDateString()}. Please return ASAP.`;
      await this.sendSMS(student.phone, smsText);
    }
  }

  async sendLostKitNotification(
    student: StudentAccount,
    transaction: BorrowTransaction
  ): Promise<void> {
    const subject = 'Lost Kit Report';
    const text = `Hello ${student.firstName},\n\n` +
      `Kit ${transaction.kit.name} has been reported as lost.\n` +
      `Please contact the library staff to discuss replacement or payment options.\n\n` +
      `Best regards,\nLibrary Kit Management System`;

    await this.sendEmail(student.email, subject, text);

    if (student.phone) {
      const smsText = `Kit ${transaction.kit.name} reported lost. Please contact library staff regarding payment.`;
      await this.sendSMS(student.phone, smsText);
    }
  }

  async sendStatusUpdateNotification(
    student: StudentAccount,
    transaction: BorrowTransaction,
    newStatus: TransactionStatus
  ): Promise<void> {
    const subject = 'Kit Status Update';
    const text = `Hello ${student.firstName},\n\n` +
      `The status of your kit ${transaction.kit.name} has been updated to ${newStatus}.\n` +
      `Please contact the library staff if you have any questions.\n\n` +
      `Best regards,\nLibrary Kit Management System`;

    await this.sendEmail(student.email, subject, text);

    if (student.phone) {
      const smsText = `Kit ${transaction.kit.name} status updated to ${newStatus}. Contact staff for details.`;
      await this.sendSMS(student.phone, smsText);
    }
  }
}