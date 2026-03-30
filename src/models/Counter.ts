import mongoose, { Schema, type Document } from "mongoose";

export interface ICounter extends Document {
  name: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);

export default Counter as mongoose.Model<ICounter>;
