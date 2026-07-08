export declare class MailService {
    private transporter;
    constructor();
    private getEmailTemplate;
    sendVerificationEmail(email: string, code: string): Promise<void>;
    sendResetPasswordEmail(email: string, code: string): Promise<void>;
}
