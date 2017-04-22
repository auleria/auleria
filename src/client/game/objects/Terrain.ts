
import { GameObject } from "../GameObject";
import { MarchingCubes } from "../../MarchingCubes";
import { SurfaceNet } from "../../SurfaceNet";
import { Simplex } from "../../Simplex";
import { Map3 } from "../../Map3";
// tslint:disable-next-line:variable-name
let Alea = require("alea") as any;

@GameObject.register
export class Terrain extends GameObject
{
	private mesh : THREE.Mesh;
	private data : Float32Array;
	private chunks = new Map3<number, number, number, Chunk>();
	public resolution = {x: 16, y: 16, z: 32};
	public chunkSize = {x: 16, y: 16, z: 32};

	public simplex : Simplex;
	public pos : THREE.Vector3;

	public clientInitialize(): void {

		this.simplex = new Simplex(new Alea(this.world.id));

		this.pos = new THREE.Vector3();
	}

	private loadChunk(x : number, y : number, z : number) : Chunk
	{
		let chunk = this.chunks.get(x, y, z);
		if (!chunk)
		{
			console.log("creating chunk at", x, y, z);
			let time = Date.now();
			chunk = new Chunk(this, x, y, z);
			chunk.clientInitialize();
			chunk.generateData();
			chunk.updateMesh();
			chunk.show();

			let result =  Date.now() - time;
			console.log("Time(ms):", result);
			this.chunks.set(x, y, z, chunk);
			return chunk;
		}
		else
		{
			chunk.show();
			return chunk;
		}
	}

	private createChunk(x : number, y : number, z : number)
	{
		let time = Date.now();
		let chunk = new Chunk(this, x, y, z);
		chunk.clientInitialize();
		chunk.generateData();
		this.chunks.set(x, y, z, chunk);
		return chunk;
	}

	public update()
	{
		let x = Math.floor(this.pos.x / 16);
		let y = Math.floor(this.pos.y / 16);
		let z = Math.floor(this.pos.z / 16);


		let chunk = this.loadChunk(x, y, 0);
		chunk.show();
	}

	public updateTerrain()
	{
		this.chunks.forEach(chunk => chunk.update());
	}

	public setData(x : number, y : number, z : number, value : number, checkEdges = true)
	{
		let chunk = this.getChunkAt(x, y, z);
		if (!chunk)
		{
			let chunkX = Math.floor(x / this.chunkSize.x);
			let chunkY = Math.floor(y / this.chunkSize.y);
			let chunkZ = Math.floor(z / this.chunkSize.z);
			chunk = this.createChunk(chunkX, chunkY, chunkZ);
			chunk.show();
		}
		let dx = Math.floor(x - chunk.x * this.resolution.x);
		let dy = Math.floor(y - chunk.y * this.resolution.y);
		let dz = Math.floor(z - chunk.z * this.resolution.z);

		if (checkEdges)
		{
			if (dx > this.resolution.x - 3) { this.setData(x + 2, y, z, value, false); }
			if (dx < 2) { this.setData(x - 2, y, z, value, false); }

			if (dy > this.resolution.y - 3) { this.setData(x, y + 2, z, value, false); }
			if (dy < 2) { this.setData(x, y - 2, z, value, false); }

			if (dz > this.resolution.z - 3) { this.setData(x, y, z + 2, value, false); }
			if (dz < 2) { this.setData(x, y, z - 2, value, false); }
		}

		chunk.setData(dx, dy, dz, value);
	}

	public getChunkAt(x : number, y : number, z : number) : Chunk
	{
		x = Math.floor(x / this.chunkSize.x);
		y = Math.floor(y / this.chunkSize.y);
		z = Math.floor(z / this.chunkSize.z);

		return this.chunks.get(x, y, z);
	}

	public onDestroy(): void
	{

	}
}

class Chunk
{
	private _x : number;
	private _y : number;
	private _z : number;
	private _mesh : THREE.Mesh;
	private _geometry : THREE.Geometry;
	private _terrain : Terrain;
	private data : Float32Array;

	private visible = false;

	public get x() { return this._x; }
	public get y() { return this._y; }
	public get z() { return this._z; }

	private _needsUpdate = false;

	constructor(terrain : Terrain, x : number, y : number, z : number)
	{
		this._terrain = terrain;
		this._x = x;
		this._y = y;
		this._z = z;
	}

	public clientInitialize()
	{
		this._mesh = new THREE.Mesh();
		this._mesh.castShadow = true;
		this._mesh.receiveShadow = true;
		this._mesh.material = new THREE.MeshStandardMaterial({color: 0xaaff99, side: THREE.DoubleSide});
		this._mesh.scale.set(this._terrain.chunkSize.x, this._terrain.chunkSize.y, this._terrain.chunkSize.z);

		// let boundingBox = new THREE.LineSegments(new THREE.BoxGeometry(1, 1, 1), new THREE.LineBasicMaterial({color: 0xffff00}));
		// boundingBox.position.x = 0.5;
		// boundingBox.position.y = 0.5;
		// boundingBox.position.z = 0.5;
		// this._mesh.add(boundingBox);
	}

	public generateData()
	{
		let i = 0;
		this.data = new Float32Array(this._terrain.resolution.x * this._terrain.resolution.y * this._terrain.resolution.z);
		for (let z = 0; z < this._terrain.resolution.z; z++)
		{
			for (let y = 0; y < this._terrain.resolution.y; y++)
			{
				for (let x = 0; x < this._terrain.resolution.x; x++)
				{
					i = z * this._terrain.resolution.y * this._terrain.resolution.x + y * this._terrain.resolution.x + x;
					let xx = x / (this._terrain.resolution.x - 2);
					let yy = y / (this._terrain.resolution.y - 2);
					let zz = z / (this._terrain.resolution.z - 2);
					let noiseX = (xx + this.x);
					let noiseY = (yy + this.y);
					let noiseZ = (zz + this.z);

					let height = this._terrain.simplex.noise3D(noiseX / 5, noiseY / 5, noiseZ) / 2 + 0.5;
					//let octave = this._terrain.simplex.noise3D(334 + noiseX, 334 + noiseY, zz);
					height = height ** 2;// + octave**2 * 0.3;
					//height = Math.min(Math.max(height, 1/this._terrain.resolution.z), (1-(1/this._terrain.resolution.z)));
					this.data[i] = 1 - ((noiseZ * 2) + height);
				}
			}
		}
	}

	public updateMesh()
	{
		let geometry = new THREE.Geometry();

		let meshData = SurfaceNet.march(this.data, {x: this._terrain.resolution.x, y: this._terrain.resolution.y, z: this._terrain.resolution.z});

		meshData.vertices.forEach(vertex => geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2])));
		meshData.faces.forEach(face => geometry.faces.push(new THREE.Face3(face[0], face[1], face[2])));

		this._mesh.geometry = geometry;
		this._mesh.name = "terrain";
		this._mesh.position.x = this.x * this._terrain.chunkSize.x;
		this._mesh.position.y = this.y * this._terrain.chunkSize.y;
		this._mesh.position.z = this.z * this._terrain.chunkSize.z;

		geometry.mergeVertices();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		geometry.verticesNeedUpdate = true;
		geometry.elementsNeedUpdate = true;
		geometry.normalsNeedUpdate = true;

		this._geometry = geometry;
	}

	public update()
	{
		if (this._needsUpdate)
		{
			this._needsUpdate = false;
			this.updateMesh();
		}
	}

	public setData(x : number, y : number, z : number, value : number)
	{
		this._needsUpdate = true;
		let i = z * this._terrain.resolution.y * this._terrain.resolution.x + y * this._terrain.resolution.x + x;
		this.data[i] = value;
	}

	public show()
	{
		if (!this.visible)
		{
			this._terrain.world.scene.add(this._mesh);
			this.visible = true;
		}
	}

	public hide()
	{
		if (this.visible)
		{
			this._terrain.world.scene.remove(this._mesh);
			this.visible = false;
		}
	}
}
