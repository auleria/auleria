
import { Remote } from "../Remote";

export class Transform
{
	@Remote.monitor(Remote.DIRECTION.BI)
	public position = new THREE.Vector3();

	@Remote.monitor(Remote.DIRECTION.BI)
	public rotation = new THREE.Quaternion();

	@Remote.monitor(Remote.DIRECTION.BI)
	public scale = new THREE.Vector3();
}
