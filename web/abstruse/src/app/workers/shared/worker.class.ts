import { formatDistanceToNow, fromUnixTime, subSeconds } from 'date-fns';

export class Worker {
  currentCPU: number;
  currentMem: number;
  cpu: { date?: Date, value: number }[][] = [[]];
  memory: { date?: Date, value: number }[][] = [[]];

  constructor(
    public id: string,
    public addr: string,
    public hostname: string,
    public uptime: number,
    public bootTime: number,
    public procs: number,
    public os: string,
    public platform: string,
    public platformFamily: string,
    public platformVersion: string,
    public kernelVersion: string,
    public kernelArch: string,
    public virtualizationSystem: string,
    public virtualizationRole: string,
    public hostID: string,
    public usage: { cpu: number, mem: number, timestamp: Date }[]
  ) {
    this.initUsage();
  }

  getUptime(): string {
    return formatDistanceToNow(fromUnixTime(this.bootTime));
  }

  private initUsage(): void {
    try {
      this.cpu = [this.usage.map((u, i) => ({ date: subSeconds(new Date(), this.usage.length - i), value: u.cpu }))];
      this.memory = [this.usage.map((u, i) => ({ date: subSeconds(new Date(), this.usage.length - i), value: u.mem }))];
      this.currentCPU = this.cpu[0][this.cpu[0].length - 1].value;
      this.currentMem = this.memory[0][this.memory[0].length - 1].value;
    } catch {
      this.currentCPU = 0;
      this.currentMem = 0;
    }
  }

  updateUsage(data: { cpu: number, mem: number }): void {
    this.cpu[0].push({ value: data.cpu, date: new Date() });
    if (this.cpu[0].length > 60) { this.cpu[0].shift(); }
    this.memory[0].push({ value: data.mem, date: new Date() });
    if (this.memory[0].length > 60) { this.memory[0].shift(); }
    this.currentCPU = data.cpu;
    this.currentMem = data.mem;
  }
}
