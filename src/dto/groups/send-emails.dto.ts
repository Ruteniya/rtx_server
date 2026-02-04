import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";
import { Pto } from "rtxtypes";

export class SendEmailsDto implements Pto.Groups.SendEmails {
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('4', { each: true })
    groupIds: string[]
}