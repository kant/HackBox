import * as moment from 'moment';

export default class StopWatch {

    private startTime: number = 0;
    private stopTime: number = 0;
    private running: boolean = false;
    private moment: any;

    constructor() {
        this.moment = moment;
    }

    public currentTime = ():number => {
        return this.moment.now();
    }

    public start = (): void => {
        this.startTime = this.currentTime();
        this.running = true;
    };

    public stop = (): void  => {
        this.stopTime = this.currentTime();
        this.running = false;
    };

    public getElapsedMilliseconds =  (): number => {
        if (this.running) {
            this.stopTime = this.currentTime();
        }
        return this.stopTime - this.startTime;
    };

    public getElapsedSeconds = (): number => {
        return this.getElapsedMilliseconds() / 1000;
    };

    public printElapsed = (name: string): void => {
        const currentName = name || 'Elapsed:';
        console.log(`${currentName} [${this.getElapsedMilliseconds()}ms] [${this.getElapsedSeconds()}s]`);
    };
}

