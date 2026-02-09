import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Config } from "src/config";

@Injectable()
export class MediaService {
    private aws: Config['aws']
    constructor(private readonly configService: ConfigService<Config, true>){
        this.aws = this.configService.get('aws', { infer: true })
    }

    getPublicUrl(key?: string){
        if(!key) return null;

        const baseUrl = this.aws.cdn;
        return `${baseUrl}/${key}`
    }
}