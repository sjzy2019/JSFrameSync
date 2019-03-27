var sync = require("sync") // 请试用您自己的路径

export default class SyncMgr {

    private static mInstance : SyncMgr = null;
    public static Instance() : SyncMgr {
        if(this.mInstance == null) {
            this.mInstance = new SyncMgr();
        }
        return this.mInstance
    }

    private frameData = null; // sync.FrameData
    private lockStep = null; // sync.LockStep

    private lastRepairTime = 0;

    private actors = []

    private rate:FixedFloat = FixedFloat.Zero();

    private isStart : boolean = false;

    private runTime: FixedFloat = FixedFloat.Zero();

    // 手动调用更新
    UpdateManual(dt) {
        // console.log("帧同步手动更新:", this.isStart);
        if(this.isStart) {
            this.lockStep.Tick(dt); // 回调 this.lockStep.SetUpdateEventCB 指定的接口
        }
    }

    Init() {
        this.isStart = false;
        this.frameData = new sync.FrameData();
        this.lockStep = new sync.LockStep();

        this.lockStep.SetUpdateEventCB(this.UpdateEvent.bind(this))
        this.lockStep.SetHandlerFrameCB(this.HandleSyncFrame.bind(this));
        this.lockStep.SetRepairCB(this.HandleRepair.bind(this))
        this.lockStep.SetFrameData(this.frameData);

        this.rate.Set(1/60);
        this.SetRate(this.rate.Value());
    }

    // 更新物理等状态
    UpdateEvent() {
        
    }

    // lockStep满足条件后回调这个函数
    // 用户需要不断的从服务器获取帧同步数据，通过AddFrame将数据添加到frameData对象中
    // UpdateEvent不断从frameData中获取数据，当有数据时回调此函数
    HandleSyncFrame(frameList) {
        for(let key in frameList) {
            let frameData = frameList[key]
            this.DealFrameData(frameData);
        }
    }

    // lockStep从frameData中获取不到数据后回调此函数，用户可以定时向服务器请求下发某一针的数据
    // GetRepaireIdxs 返回缺少的帧 从最小的帧到最大的帧
    HandleRepair() {
        console.log("缺少帧信息", this.GetRepaireIdxs())
    }

    GetRepaireIdxs() {
        return this.frameData.GetRepaireIdxs();
    }

    /////////////// FrameData 接口 ///////////////

    AddFrame(frameIndex:number, frameList:any) : any {
        let addInfo = this.frameData.AddFrame(frameIndex, frameList);
        this.SetForwardSpeed(addInfo.speed);
    }

    GetFrameIndex() {
        return this.frameData.GetFrameIndex();
    }

    GetMaxFrameIndex() {
        return this.frameData.GetMaxFrameIndex();
    }

    GetFrameDic() {
        return this.frameData.GetFrameDic();
    }

    /////////////// FrameData 接口 ///////////////
    //////////////// LockStep 接口 //////////////////

    SetRate(rate:number) {
        this.lockStep.SetRate(rate);
    }

    GetRate() : FixedFloat {
        return this.rate;
    }

    GetRunTime() : FixedFloat {
        return this.runTime;
    }

    SetForwardSpeed(speed:number) {
        this.lockStep.SetForwardSpeed(speed);
    }
    //////////////// LockStep 接口 //////////////////
    
}

export {SyncMgr}
