
import { GameWorld } from "../GameWorld";
import { DebugObject } from "../objects/DebugObject";
import { Remote } from "../../Remote";
import { Classes } from "../../Classes";
import { NetworkCode } from "../../NetworkCode";
import { ByteBuffer } from "../../ByteBuffer";

@Classes.register
export class DebugWorld extends GameWorld
{
	private terrainMesh : THREE.Mesh;

	public players = new Map<string, DebugObject>();

	public initialize()
	{
		if (this.isMaster)
		{
			console.log("Debug World created, id is", this.id, "me is", this.me);

			this.on("join", (data, playerid) => {
				this.add(new DebugObject(playerid));
			});

			this.on("left", (data, playerid) => {
				let object = this.players.get(playerid);
				this.players.delete(playerid);
				this.destroy(object);
			});
		}
		else
		{
			console.log("DebugWorld created on client with id", this.id);
			this.mainCamera.position.z = 2;
			this.mainCamera.position.y = -2;
			this.terrainMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({color: 0xffffff}));
			this.scene.add(this.terrainMesh);

			let hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 2 );
			this.scene.add( hemiLight );

			this.mainCamera.lookAt(this.terrainMesh.position);
		}
	}
}
