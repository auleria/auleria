/**
 * A simple bytebuffer
 */
import { Helper } from "./Helper";

enum types {
	BYTE = 1,
	SHORT = 2,
	INTEGER = 4,
	ID = 8
};

export class ByteBuffer
{
	private arrayBuffer : ArrayBuffer;
	private dataView : DataView;
	private _position : number;
	private limitPosition = Infinity;

	private measurePointStart : number;

	public get position() { return this._position; }

	constructor(buffer : ArrayBuffer = null)
	{
		if (buffer !== null)
		{
			this.arrayBuffer = buffer;
		}
		else
		{
			this.arrayBuffer = new ArrayBuffer(64000);
		}
		this.dataView = new DataView(this.arrayBuffer);
		this._position = 0;
	}


	public seek(position : number)
	{
		this._position = position;
	}

	public moveForward(count : number)
	{
		if (this._position + 16 > this.dataView.byteLength)
		{
			let newbuffer = new ArrayBuffer(this.arrayBuffer.byteLength * 2);
			let uint8 = new Uint8Array(newbuffer);
			uint8.set(new Uint8Array(this.dataView.buffer));

			this.arrayBuffer = uint8.buffer;
			this.dataView = new DataView(this.arrayBuffer);
		}

		this._position += count;
	}


	public reset()
	{
		this._position = 0;
	}

	public getTrimmedBuffer()
	{
		return this.arrayBuffer.slice(0, this._position);
	}

	public gotData()
	{
		return this._position < Math.min(this.arrayBuffer.byteLength, this.limitPosition);
	}

	public limit(position : number)
	{
		this.limitPosition = position;
	}

	public removeLimit()
	{
		this.limitPosition = Infinity;
	}

	public createMeasurePoint()
	{
		this.moveForward(types.INTEGER);
		this.measurePointStart = this.position;
	}

	public writeMeasure()
	{
		let curpos = this.position;
		this.seek(this.measurePointStart - types.INTEGER);
		this.writeInt32(curpos - this.measurePointStart);
		this.seek(curpos);
	}

	public writeByte(value : number)
	{
		this.dataView.setUint8(this._position, value);
		this.moveForward(1);
	}

	public writeShort(value : number)
	{
		this.dataView.setUint16(this._position, value);
		this.moveForward(2);
	}

	public writeInt32(value : number)
	{
		this.dataView.setInt32(this._position, value);
		this.moveForward(4);
	}

	public writeFloat(value : number)
	{
		this.dataView.setFloat32(this._position, value);
		this.moveForward(4);
	}

	public writeString(str : string)
	{
		let enc = null;
		enc = new Buffer(str, "utf8");
		this.dataView.setUint16(this._position, enc.byteLength);
		this.moveForward(2);
		for (let i = 0; i < enc.byteLength; i++)
		{
			this.dataView.setUint8(this._position + i, enc[i]);
		}
		this.moveForward(enc.byteLength);
	}

	public writeId(id : string)
	{
		for (let i = 0; i < Helper.ID_SIZE; i++)
		{
			this.dataView.setUint8(this._position + i, id.charCodeAt(i));
		}
		this.moveForward(Helper.ID_SIZE);
	}

	public readByte()
	{
		let value = this.dataView.getUint8(this._position);
		this._position++;
		return value;
	}

	public readShort()
	{
		let l = this.dataView.byteLength;
		let value = this.dataView.getUint16(this._position);
		this._position += 2;
		return value;
	}

	public readInt32()
	{
		let value = this.dataView.getInt32(this._position);
		this._position += 4;
		return value;
	}

	public readFloat()
	{
		let value = this.dataView.getFloat32(this._position);
		this._position += 4;
		return value;
	}

	public readString()
	{
		let length = this.dataView.getUint16(this._position);
		this._position += 2;
		let sb = new Uint8Array(this.arrayBuffer, this._position, length);
		this._position += length;
		return (new Buffer(sb)).toString("utf8");
	}

	public readId()
	{
		let array = new Uint8Array(this.arrayBuffer, this._position, Helper.ID_SIZE);
		this._position += Helper.ID_SIZE;
		return String.fromCharCode(...array);
	}

}
