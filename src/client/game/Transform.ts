
import { Remote } from "../Remote";
import { ByteBuffer } from "../ByteBuffer";

export class Transform
{
	public position = new THREE.Vector3();
	public scale = new THREE.Vector3();
	public rotation = new THREE.Quaternion();

	public static positionByteLength = 12;
	public static scaleByteLength = 12;
	public static rotationByteLength = 16;
	public static byteLength = 40;

	public writeToBuffer(bb : ByteBuffer)
	{
		this.writePositionToBuffer(bb);
		this.writeScaleToBuffer(bb);
		this.writeRotationToBuffer(bb);
	}

	public writePositionToBuffer(bb : ByteBuffer)
	{
		bb.writeFloat(this.position.x);
		bb.writeFloat(this.position.y);
		bb.writeFloat(this.position.z);
	}

	public writeScaleToBuffer(bb : ByteBuffer)
	{
		bb.writeFloat(this.scale.x);
		bb.writeFloat(this.scale.y);
		bb.writeFloat(this.scale.z);
	}

	public writeRotationToBuffer(bb : ByteBuffer)
	{
		bb.writeFloat(this.rotation.x);
		bb.writeFloat(this.rotation.y);
		bb.writeFloat(this.rotation.z);
		bb.writeFloat(this.rotation.w);
	}

	public readFromBuffer(bb : ByteBuffer)
	{
		this.readPositionFromBuffer(bb);
		this.readScaleFromBuffer(bb);
		this.readRotationFromBuffer(bb);
	}

	public readPositionFromBuffer(bb : ByteBuffer)
	{
		this.position.x = bb.readFloat();
		this.position.y = bb.readFloat();
		this.position.z = bb.readFloat();
	}

	public readScaleFromBuffer(bb : ByteBuffer)
	{
		this.scale.x = bb.readFloat();
		this.scale.y = bb.readFloat();
		this.scale.z = bb.readFloat();
	}

	public readRotationFromBuffer(bb : ByteBuffer)
	{
		this.rotation.x = bb.readFloat();
		this.rotation.y = bb.readFloat();
		this.rotation.z = bb.readFloat();
		this.rotation.w = bb.readFloat();
	}
}
