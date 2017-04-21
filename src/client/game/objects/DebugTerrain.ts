
import { GameObject } from "../GameObject";
import { MarchingCubes } from "../../MarchingCubes";
import { SurfaceNet } from "../../SurfaceNet";
import { Simplex } from "../../Simplex";
// tslint:disable-next-line:variable-name
let Alea = require("alea") as any;

export class DebugTerrain extends GameObject
{
	private mesh : THREE.Mesh;
	private data : Float32Array;
	private x = 0;
	private y = 0;
	private t = 0;
	private simplex : Simplex;

	public constructor(x : number = 0, y : number = 0)
	{
		super();
		this.x = x;
		this.y = y;
	}

	public clientInitialize(): void {


		let size = {x:16, y:16, z:32};
		this.data = new Float32Array(size.x * size.y * size.z);

		this.simplex = new Simplex(new Alea(this.world.id));

		let i = 0;
		for (let z = 0; z < size.z; z++)
		{
			for (let y = 0; y < size.y; y++)
			{
				for (let x = 0; x < size.x; x++)
				{
					i = z * size.y * size.x + y * size.x + x;
					let xx = x / (size.x - 2);
					let yy = y / (size.y - 2);
					let zz = z / size.z;
					let noiseX = (xx + this.x);
					let noiseY = (yy + this.y);

					let height = this.simplex.noise3D(noiseX / 5, noiseY / 5, zz) / 2 + 0.5;
					let octave = this.simplex.noise3D(334 + noiseX, 334 + noiseY, zz);
					height = height ** 2 + octave**2 * 0.1;
					height = Math.min(Math.max(height, 1/size.z), (1-(1/size.z)));
					this.data[i] = 1 - ((zz * 2) + height);
				}
			}
		}
		let geometry = new THREE.Geometry();


		//let meshData = MarchingCubes.march(this.data, {x:size.x, y:size.y, z:size.z});

		let meshData = SurfaceNet.march(this.data, {x:size.x, y:size.y, z:size.z});

		meshData.vertices.forEach(vertex => geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2])));
		meshData.faces.forEach(face => geometry.faces.push(new THREE.Face3(face[0], face[1], face[2])));

		this.mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0xaaff99, side: THREE.BackSide}));
		this.mesh.name = "terrain";
		this.mesh.position.x += this.x;
		this.mesh.position.y += this.y;

		geometry.mergeVertices();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		geometry.verticesNeedUpdate = true;
		geometry.elementsNeedUpdate = true;
		geometry.normalsNeedUpdate = true;

		this.world.scene.add(this.mesh);

	}

	public onDestroy(): void {
		this.world.scene.remove(this.mesh);
	}
}