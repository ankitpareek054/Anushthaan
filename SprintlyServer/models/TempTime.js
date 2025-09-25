import mongoose from "mongoose";

const TempTimeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "registers" },
    startTime: { type: Date, default: null },
    elapsedTime: { type: Number, default: 0 },
    breakTime: { type: Number, default: 0 },
    date : {type: String, default: new Date().toLocaleDateString()},
    projectName:{type:String},
    started : {type: Boolean, default: false},
    paused : {type: Boolean, default: false},
    pausedAt: { type: Number, default: 0 },
    
});

const TempTimeModel = mongoose.model("TempTime", TempTimeSchema);

export default TempTimeModel;