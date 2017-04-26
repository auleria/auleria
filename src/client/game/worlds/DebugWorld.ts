
import { GameWorld } from "../GameWorld";
import { DebugObject } from "../objects/DebugObject";
import { Remote } from "../../Remote";
import { Classes } from "../../Classes";
import { NetworkCode } from "../../NetworkCode";
import { ByteBuffer } from "../../ByteBuffer";
import { Terrain } from "../objects/Terrain";
import { Input } from "../../Input";

@Classes.register
export class DebugWorld extends GameWorld
{
	private point : THREE.Mesh;
	private raycaster = new THREE.Raycaster();

	public players = new Map<string, DebugObject>();

	private t = 0;
	private d = 0;
	private terrain : Terrain;

	private click = false;

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
			this.mainCamera.position.z = 60;
			this.mainCamera.position.y = -60;

			let hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 2 );
			this.scene.add( hemiLight );

			this.mainCamera.lookAt(new THREE.Vector3(0,0,0));
		}
	}

	public clientInitialize()
	{
		let terrain = this.add(new Terrain());

		this.point = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0xffffff}));
		this.point.position.z = 20;
		//let pointLight = new THREE.PointLight(0xffffff, 1, 32);
		//pointLight.castShadow = true;
		//this.point.add(pointLight);
		//this.scene.add(this.point);

		let lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(0, 0, 20));
		lineGeom.vertices.push(new THREE.Vector3(0, 0, -20));
		let line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({color: 0xff0000}));
		this.point.add(line);
		//this.scene.add(line);

		terrain.pos = this.point.position;
		this.terrain = terrain;
	}

	public update()
	{
		this.t += 0.5 / (this.d * Math.PI * 2);
		if (this.t>=1 && this.d < 10)
		{
			this.d++;
			this.t = 0;
		}
		else if (this.d > 10)
		{
			this.d = 0;
			this.t = 0;
		}
		this.point.position.x = Math.cos(this.t * 2 * Math.PI) * this.d * 16;
		this.point.position.y = Math.sin(this.t * 2 * Math.PI) * this.d * 16;

		if ((Input.mouse.left && !this.click) || Input.mouse.right)
		{
			let mouse = {x: (Input.mouse.x / window.innerWidth) * 2 - 1, y: - (Input.mouse.y / window.innerHeight) * 2 + 1};

			this.terrain.raycaster.setFromCamera(mouse, this.mainCamera);
			let hit = this.terrain.trace();
			if (hit)
			{
				let radius = 1;
				// tslint:disable-next-line:curly
				for (let x = -radius; x <= radius; x++)
				// tslint:disable-next-line:curly
				for (let y = -radius; y <= radius; y++)
				// tslint:disable-next-line:curly
				for (let z = -radius; z <= radius; z++)
				{
					this.terrain.setData(hit.point.x + x, hit.point.y + y, hit.point.z - z, 1);
				}

				this.terrain.updateTerrain();
			}
			this.click = true;
		}
		else if (!Input.mouse.left)
		{
			this.click = false;
		}

		super.update();
	}
}
