
import { Remote } from "../Remote";
import { ByteBuffer } from "../ByteBuffer";

export class Transform
{
	public position = new THREE.Vector3();
	public scale = new THREE.Vector3();
	public rotation = new THREE.Quaternion();

	public writeToBuffer(bb : ByteBuffer)
	{
		bb.writeFloat(this.position.x);
		bb.writeFloat(this.position.y);
		bb.writeFloat(this.position.z);

		bb.writeFloat(this.scale.x);
		bb.writeFloat(this.scale.y);
		bb.writeFloat(this.scale.z);

		bb.writeFloat(this.rotation.x);
		bb.writeFloat(this.rotation.y);
		bb.writeFloat(this.rotation.z);
		bb.writeFloat(this.rotation.w);
	}

	public readFromBuffer(bb : ByteBuffer)
	{
		this.position.x = bb.readFloat();
		this.position.y = bb.readFloat();
		this.position.z = bb.readFloat();

		this.scale.x = bb.readFloat();
		this.scale.y = bb.readFloat();
		this.scale.z = bb.readFloat();

		this.rotation.x = bb.readFloat();
		this.rotation.y = bb.readFloat();
		this.rotation.z = bb.readFloat();
		this.rotation.w = bb.readFloat();
	}
}
