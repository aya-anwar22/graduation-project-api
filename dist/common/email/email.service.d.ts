import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendSupervisionRequestNotification(to: string[], projectName: string, status: 'approved' | 'rejected', doctorName: string): Promise<void>;
}
