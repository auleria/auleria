
import { GameObject } from "../GameObject";
import { Map2 } from "../../Map2";
import { Simplex } from "../../Simplex";
// tslint:disable-next-line:variable-name
let Alea = require("alea") as any;

export class SimpleTerrain extends GameObject
{
	private chunks = new Map2<number, number, Chunk>();
	private chunk : Chunk;

	public simplex : Simplex;
	public octaves = 1;

	public material : THREE.Material;

	private buffer : Float32Array;
	private normalBuffer : Float32Array;
	private normalSkipBuffer : Uint8Array;

	private t = 0;

	public clientInitialize()
	{
		this.simplex = new Simplex(new Alea(this.world.id));

		this.material = new THREE.MeshStandardMaterial({color: 0xaaff99});
		//let chunk = new Chunk(this, 0, 0, 200, {x: 200, y: 200, z: 20});

		var size = 256 + 1;

		this.buffer = new Float32Array(size * size * 3);
		this.normalBuffer = new Float32Array(size * size * 3);
		this.normalSkipBuffer = new Uint8Array(size * size);

		var viewDist = 1;

		this.chunk = new Chunk(this, 0, 0, size - 1, {x: 100, y: 100, z: 20});
		this.chunk.setBuffers(this.buffer, this.normalBuffer, this.normalSkipBuffer);
		this.chunk.clientInitialize();
		/*
		for (var y = -viewDist; y <= viewDist; y++)
		{
			for (var x = -viewDist; x <= viewDist; x++)
			{
				var res = 256 / Math.min((1 << Math.max(Math.abs(y), Math.abs(x))), 8);
				var chunk = new Chunk(this, x * 100, y * 40, res, {x: 100, y: 100, z: 20});
				chunk.setBuffers(this.buffer, this.normalBuffer, this.normalSkipBuffer);
				chunk.clientInitialize();
				this.chunk = chunk;
				this.chunks.set(x, y, chunk);
			}
		}
		*/
	}

	public update()
	{
		this.t += 0.01;
		/*
		this.chunks.forEach((chunk, x, y) => {
			chunk.x = (x * 100) + Math.cos(this.t) * 10;
			chunk.y = (y * 100) + Math.sin(this.t) * 10;
			chunk.update();
		});
		*/
		this.chunk.x = Math.cos(this.t) * 10;
		this.chunk.update();
	}
}

class Chunk
{
	public x : number;
	public y : number;
	private size : {x:number, y: number, z:number};
	private segmentSize : {x:number, y:number, z:number};
	private resolution : number;
	private terrain : SimpleTerrain;
	private octaves : number;

	private geometry : THREE.BufferGeometry;
	private mesh : THREE.Mesh;
	private  indices : Uint32Array;
	private vertices : Float32Array;
	private normals : Float32Array;

	private t = 0;
	private offsetX = 0;
	private offsetY = 0;

	private buffer : Float32Array;
	private normalBuffer : Float32Array;
	private normalSkipBuffer : Uint8Array;

	constructor(terrain : SimpleTerrain, x : number, y : number, resolution : number, size : {x:number, y:number, z:number})
	{
		this.x = x;
		this.y = y;
		this.resolution = resolution + 1;
		this.size = size;
		this.segmentSize = {x: size.x / (resolution - 1), y: size.y / (resolution - 1), z: size.z / (resolution - 1)};
		this.terrain = terrain;
		this.octaves = this.terrain.octaves;
	}

	public setBuffers(vectorBuffer : Float32Array, normalBuffer : Float32Array, normalSkipBuffer : Uint8Array)
	{
		this.buffer = vectorBuffer;
		this.normalBuffer = normalBuffer;
		this.normalSkipBuffer = normalSkipBuffer;
	}

	public clientInitialize()
	{
		this.geometry = new THREE.BufferGeometry();

		let vertices = new Float32Array(this.resolution ** 2 * 3);
		let normals = new Float32Array(this.resolution ** 2 * 3);
		let indices = new Uint32Array((this.resolution - 1) ** 2 * 2 * 3);

		let a, b, c, d, ux, uy, uz, vx, vy, vz, ai, bi, ci, di;

		for (let i = 0, y = 0, x = 0; y < this.resolution; y++)
		{
			for (x = 0; x < this.resolution; x++)
			{
				vertices[i++] = x * this.segmentSize.x;
				vertices[i++] = y * this.segmentSize.y;
				normals[i++] = 1; // SKip the vertiex Z and set the normal Z to 1 instead, two in one!
			}
		}

		for (let i = 0, fi = 0,y = 0; y < this.resolution - 1; y++)
		{
			for (let x = 0; x < this.resolution - 1; x++)
			{
				a = y * this.resolution + x;
				b = y * this.resolution + x + 1;
				c = (y + 1) * this.resolution + x + 1;
				d = (y + 1) * this.resolution + x;

				indices[i++] = a;
				indices[i++] = b;
				indices[i++] = c;

				indices[i++] = a;
				indices[i++] = c;
				indices[i++] = d;
			}
		}

		this.vertices = vertices;
		this.indices = indices;
		this.normals = normals;

		this.geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
		this.geometry.addAttribute("normal", new THREE.BufferAttribute(normals, 3));
		this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));

		this.moveTo(this.x, this.y, true);

		this.mesh = new THREE.Mesh(this.geometry, this.terrain.material);

		this.terrain.world.scene.add(this.mesh);
	}

	public moveTo(x : number, y : number, force : boolean = false)
	{
		var multiplier = this.segmentSize;
		var offsetX = Math.floor(x / multiplier.x);
		var offsetY = Math.floor(y / multiplier.y);

		var stepX = offsetX - this.offsetX;
		var stepY = offsetY - this.offsetY;

		if (stepX !== 0 || stepY !== 0 || force)
		{
			var cutoffX = this.resolution - stepX;
			var cutoffY = this.resolution - stepY;
			var cutoffXBegin = Math.abs(stepX);
			var cutoffYBegin = Math.abs(stepY);

			this.buffer.set(this.vertices);
			this.normalBuffer.set(this.normals);

			var omulBase = 10;

			for (var v = 0,y = 0; y < this.resolution; y++)
			{
				var yInc = y * this.resolution;
				for (var x = 0; x < this.resolution; x++)
				{
					v = (x + yInc) * 3;
					if ((x < cutoffX && y < cutoffY) && (x > cutoffXBegin && y > cutoffYBegin) && !force)
					{
						var step = 3 * (stepX + this.resolution * stepY);
						this.normals[v] = this.normalBuffer[v + step];
						this.normals[v + 1] = this.normalBuffer[v + 1 + step];
						this.normals[v + 2] = this.normalBuffer[v + 2 + step];
						var tmp = this.buffer[v + 2 + step];
						this.vertices[v + 2] = tmp;
						this.normalSkipBuffer[v / 3] = 1;
					}
					else
					{
						this.normals[v] = 0;
						this.normals[v + 1] = 0;
						this.normals[v + 2] = 0;
						this.normalSkipBuffer[v / 3] = 0;
						var z = 0;
						var xx = (x + offsetX) / this.resolution;
						var yy = (y + offsetY) / this.resolution;
						for (var o = 0; o < this.octaves; o++)
						{
							var omul = Math.pow(omulBase, o);
							z += this.terrain.simplex.noise2D(xx * omul, yy * omul) / (1 << o);
						}
						this.vertices[v + 2] = Math.pow(z, 2) * this.size.z;
					}
				}
			}

			var ai, ax, ay, az, bi, bx, by, bz, ci, cx, cy, cz, cbx, cby, cbz, abx, aby, abz, nx, ny, nz, offset;
			var normals = this.normals;

			for (var i = 0, n = 0; i < this.indices.length; i+=3)
			{
				// Fetch the 3 vertices making this triangle
				ai = this.indices[ i ];
				bi = this.indices[ i + 1 ];
				ci = this.indices[ i + 2 ];

				if (this.normalSkipBuffer[ai] + this.normalSkipBuffer[bi] + this.normalSkipBuffer[ci] === 3)
				{
					continue;
				}

				ai *= 3;
				bi *= 3;
				ci *= 3;

				// A
				ax = this.vertices[ ai ];
				ay = this.vertices[ ai + 1];
				az = this.vertices[ ai + 2];

				// B
				bx = this.vertices[ bi ];
				by = this.vertices[ bi + 1 ];
				bz = this.vertices[ bi + 2 ];
				// C

				cx = this.vertices[ ci ];
				cy = this.vertices[ ci + 1 ];
				cz = this.vertices[ ci + 2 ];

				// Subtract the vertices to get the tangents
				// cb
				cbx = cx - bx;
				cby = cy - by;
				cbz = cz - bz;

				// ab
				abx = ax - bx;
				aby = ay - by;
				abz = az - bz;

				// Calculate the cross product of the two first vectors
				// R
				nx = cby * abz - cbz * aby;
				ny = cbz * abx - cbx * abz;
				nz = cbx * aby - cby * abx;

				// Add the (non normalized) normals to the vertices involved
				normals[ ai ] += nx;
				normals[ ai + 1 ] += ny;
				normals[ ai + 2 ] += nz;

				normals[ bi ] += nx;
				normals[ bi + 1 ] += ny;
				normals[ bi + 2 ] += nz;

				normals[ ci ] += nx;
				normals[ ci + 1 ] += ny;
				normals[ ci + 2 ] += nz;
			}

			for (var i = 0; i < this.normals.length; i+= 3)
			{
				if (this.normalSkipBuffer[i/3] === 1)
				{
					continue;
				}
				nx = this.normals[i];
				ny = this.normals[i + 1];
				nz = this.normals[i + 2];

				var mag = Math.sqrt(nx * nx + ny * ny + nz * nz);

				this.normals[i] /= mag;
				this.normals[i + 1] /= mag;
				this.normals[i + 2] /= mag;
			}

			(this.geometry.attributes as any).position.needsUpdate = true;
			(this.geometry.attributes as any).normal.needsUpdate = true;

		}

		this.offsetX = offsetX;
		this.offsetY = offsetY;

		//this.geometry.computeVertexNormals();

	}

	public update()
	{
		this.moveTo(this.x, this.y, false);
		this.mesh.position.x = Math.floor(this.x / this.segmentSize.x) * this.segmentSize.x - this.size.x / 2;
		this.mesh.position.y = Math.floor(this.y / this.segmentSize.y) * this.segmentSize.y - this.size.y / 2;
	}

	public generate()
	{

	}
}
