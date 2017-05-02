
import { GameObject } from "../GameObject";
import { Map2 } from "../../Map2";
import { Simplex } from "../../Simplex";
// tslint:disable-next-line:variable-name
let Alea = require("alea") as any;

export class SimpleTerrain extends GameObject
{
	private octaves = 1;
	private chunks = new Map2<number, number, Chunk>();

	public simplex : Simplex;

	public material : THREE.Material;

	public clientInitialize()
	{
		this.simplex = new Simplex(new Alea(this.world.id));

		this.material = new THREE.MeshNormalMaterial({});
		let chunk = new Chunk(this, 0, 0, 100, {x: 100, y: 100, z: 100});
		chunk.clientInitialize();
	}
}

class Chunk
{
	private x : number;
	private y : number;
	private size : {x:number, y: number, z:number};
	private resolution : number;
	private terrain : SimpleTerrain;

	private geometry : THREE.BufferGeometry;
	private mesh : THREE.Mesh;

	constructor(terrain : SimpleTerrain, x : number, y : number, resolution : number, size : {x:number, y:number, z:number})
	{
		this.x = x;
		this.y = y;
		this.resolution = resolution;
		this.size = size;
		this.terrain = terrain;
	}

	public clientInitialize()
	{
		this.geometry = new THREE.BufferGeometry();

		let vertices = new Float32Array(this.resolution ** 2 * 3);
		let indices = new Uint16Array(this.resolution ** 2 * 2 * 3);
		let faceNormals = new Float32Array(this.resolution ** 2 * 3);

		let multiplier = {x : this.size.x / this.resolution, y : this.size.y / this.resolution};

		for (let i = 0,y = 0; y < this.resolution; y++)
		{
			for (let x = 0; x < this.resolution; x++)
			{
				vertices[i++] = x * multiplier.x;
				vertices[i++] = y * multiplier.y;
				vertices[i++] = this.terrain.simplex.noise2D(x / 10, y / 10);
			}
		}

		let a, b, c, d, ux, uy, uz, vx, vy, vz, ai, bi, ci, di;

		for (let i = 0, fi = 0,y = 0; y < this.resolution - 1; y++)
		{
			for (let x = 0; x < this.resolution - 1; x++)
			{
				a = y * this.resolution + x;
				b = y * this.resolution + x + 1;
				c = (y + 1) * this.resolution + x + 1;
				d = (y + 1) * this.resolution + x;

				ai = a * 3;
				bi = b * 3;
				ci = c * 3;
				di = d * 3;

				indices[i++] = a;
				indices[i++] = b;
				indices[i++] = c;

				ux = vertices[bi] - vertices[ai];
				uy = vertices[bi + 1] - vertices[ai + 1];
				uz = vertices[bi + 2] - vertices[ai + 2];

				vx = vertices[ci] - vertices[ai];
				vy = vertices[ci + 1] - vertices[ai + 1];
				vz = vertices[ci + 2] - vertices[ai + 2];

				faceNormals[fi++] = uy * vz - uz * vy;
				faceNormals[fi++] = uz * vx - ux * vz;
				faceNormals[fi++] = ux * vy - uy * vx;

				indices[i++] = a;
				indices[i++] = c;
				indices[i++] = d;

				ux = vertices[ci] - vertices[ai];
				uy = vertices[ci + 1] - vertices[ai + 1];
				uz = vertices[ci + 2] - vertices[ai + 2];

				vx = vertices[di] - vertices[ai];
				vy = vertices[di + 1] - vertices[ai + 1];
				vz = vertices[di + 2] - vertices[ai + 2];

				faceNormals[fi++] = uy * vz - uz * vy;
				faceNormals[fi++] = uz * vx - ux * vz;
				faceNormals[fi++] = ux * vy - uy * vx;
			}
		}

		this.geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
		this.geometry.addAttribute("normal", new THREE.BufferAttribute(faceNormals, 3));
		this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));

		this.mesh = new THREE.Mesh(this.geometry, this.terrain.material);

		this.terrain.world.scene.add(this.mesh);
	}

	public generate()
	{

	}
}