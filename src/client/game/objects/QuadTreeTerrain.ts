
import { GameObject } from "../GameObject";
import { Map2 } from "../../Map2";
import { Simplex } from "../../Simplex";
// tslint:disable-next-line:variable-name
let Alea = require("alea") as any;

export class QuadTreeTerrain extends GameObject
{
	private tree : Map2<number, number, Quad>;

	public poi : THREE.Vector3;
	private t = 0;

	private mesh : THREE.Mesh;
	private geom : THREE.Geometry;

	private quadSize : number;

	public octaves = 10;
	public simplex : Simplex;
	public material : THREE.Material;
	public group : THREE.Group;

	public clientInitialize()
	{
		this.tree = new Map2<number, number, Quad>();
		let radius = 3;
		this.quadSize = 1024;
		this.group = new THREE.Group();
		for (var y = 0; y < radius; y++)
		{
			for (var x = 0; x < radius; x++)
			{
				var xx = x * this.quadSize - (radius * this.quadSize) / 2;
				var yy = y * this.quadSize - (radius * this.quadSize) / 2;
				this.tree.set(x, y, new Quad(null, 0, new THREE.Vector3(xx, yy), this.quadSize));
			}
		}
		this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshNormalMaterial());
		this.world.scene.add(this.mesh);
		this.poi = this.mesh.position;
		this.poi.z = 2;

		this.geom = new THREE.Geometry();
		this.geom.vertices.push(new THREE.Vector3(0, 0));
		this.geom.vertices.push(new THREE.Vector3(1, 0));
		this.geom.vertices.push(new THREE.Vector3(1, 1));
		this.geom.vertices.push(new THREE.Vector3(0, 1));
		this.geom.vertices.push(new THREE.Vector3(0, 0));

		this.simplex = new Simplex(new Alea(this.world.id));
		this.material = new THREE.MeshStandardMaterial({color: 0xaaff99});
		this.world.scene.add(this.group);
	}

	public getHeightAt(x : number, y : number)
	{
<<<<<<< HEAD
		// TODO: use terrain height calculation from chunk instead.
=======
		// use terrain height calculation from chunk instead.
>>>>>>> 44191d2bc9fe0cde6eabb9763fdca54fc8569f10
		let ray = new THREE.Raycaster(new THREE.Vector3(x, y, 1000), new THREE.Vector3(0,0,-1), 1, 2000);
		let hits = ray.intersectObjects(this.group.children);
		let hit = hits[0];
		if (hit)
		{
			return hit.point.z;
		}
		
		return 0;
	}

	public update()
	{
		this.tree.forEach(quad => this.handleQuad(quad));
	}

	public handleQuad(quad : Quad)
	{
		let dist = quad.position.clone().addScalar(quad.size / 2).distanceTo(this.poi);
		if (dist < (this.quadSize * 3) >> quad.depth && quad.depth < 5)
		{
			if (quad.value)
			{
				quad.value.dispose();
				quad.value = null;
			}
			quad.forEach(quad => this.handleQuad(quad));
		}
		else
		{
			if (!quad.value)
			{

				let chunk = new Chunk(this, quad.position.x, quad.position.y, 40, {x:quad.size, y:quad.size, z: 100});
				chunk.clientInitialize();
				quad.value = chunk;
			}

			if (quad.hasChildren)
			{
				quad.deepForEach(child => {
					child.value.dispose();
				});
				quad.hasChildren = false;
				quad.quads = new Array<Quad>(4);
			}
		}
	}
}

class Quad
{
	public position : THREE.Vector3;
	public size : number;
	public depth : number;
	public quads = new Array<Quad>(4);
	public value : any;
	public parent : Quad;
	public hasChildren  = false;

	constructor(parent : Quad, n : number, position? : THREE.Vector3, size? : number)
	{
		if (parent)
		{
			this.depth = parent.depth + 1;
			this.position = new THREE.Vector3(parent.position.x + ((n % 2) * .5) * parent.size, parent.position.y + (n > 1 ? 0.5 : 0) * parent.size);
			this.size = parent.size / 2;
			this.parent = parent;
		}
		else
		{
			this.depth = 0;
			this.position = position || new THREE.Vector3(0,0);
			this.size = size || 128;
			this.parent = null;
		}
	}

	public forEach(callback : (quad : Quad) => void)
	{
		if (!this.hasChildren)
		{
			this.quads[0] = new Quad(this, 0);
			this.quads[1] = new Quad(this, 1);
			this.quads[2] = new Quad(this, 2);
			this.quads[3] = new Quad(this, 3);
			this.hasChildren = true;
		}
		this.quads.forEach(quad => callback(quad));
	}

	public deepForEach(callback : (quad : Quad) => void)
	{
		if (this.hasChildren)
		{
			this.quads.forEach(child => child.deepForEach(quad => callback(quad)));
		}
		else
		{
			callback(this);
		}
	}
}

class Chunk
{
	public x : number;
	public y : number;
	private size : {x:number, y: number, z:number};
	private segmentSize : {x:number, y:number, z:number};
	private resolution : number;
	private terrain : QuadTreeTerrain;
	private octaves : number;

	private geometry : THREE.BufferGeometry;
	private mesh : THREE.Mesh;
	private  indices : Uint32Array;
	private vertices : Float32Array;
	private normals : Float32Array;

	private t = 0;
	private offsetX = 0;
	private offsetY = 0;

	constructor(terrain : QuadTreeTerrain, x : number, y : number, resolution : number, size : {x:number, y:number, z:number})
	{
		this.x = x;
		this.y = y;
		this.resolution = resolution;
		this.size = size;
		this.segmentSize = {x: size.x / (resolution - 1), y: size.y / (resolution - 1), z: size.z / (resolution - 1)};
		this.terrain = terrain;
		this.octaves = this.terrain.octaves;
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

		this.moveTo(this.x, this.y, true);

		this.geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
		this.geometry.addAttribute("normal", new THREE.BufferAttribute(normals, 3));
		this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));

		this.mesh = new THREE.Mesh(this.geometry, this.terrain.material);

		this.mesh.position.x = this.x;
		this.mesh.position.y = this.y;

		this.terrain.group.add(this.mesh);
	}

	public dispose()
	{
		this.terrain.group.remove(this.mesh);
		this.mesh.geometry.dispose();
		this.mesh = null;
		this.geometry = null;
		this.vertices = null;
		this.indices = null;
		this.normals = null;
	}

	public moveTo(x : number, y : number, force : boolean = false)
	{
		var multiplier = this.segmentSize;
		var offsetX = Math.floor(x / multiplier.x);
		var offsetY = Math.floor(y / multiplier.y);

		var stepX = offsetX - this.offsetX;
		var stepY = offsetY - this.offsetY;

		var omulBase = 50 / this.segmentSize.x;

		for (var v = 0,y = 0; y < this.resolution; y++)
		{
			var yInc = y * this.resolution;
			for (var x = 0; x < this.resolution; x++)
			{
				v = (x + yInc) * 3;
				var z = 0;
				var xx = (x + offsetX) / this.resolution;
				var yy = (y + offsetY) / this.resolution;
				for (var o = 0; o < this.octaves; o++)
				{
					var omul = Math.pow(2, o) / omulBase;
					z += this.terrain.simplex.noise2D(xx * omul, yy * omul) / (1 << o);
				}
				this.vertices[v + 2] = Math.pow(z, 2) * this.size.z;
			}
		}

		var ai, ax, ay, az, bi, bx, by, bz, ci, cx, cy, cz, cbx, cby, cbz, abx, aby, abz, nx, ny, nz, offset;
		var normals = this.normals;

		for (var i = 0, n = 0; i < this.indices.length; i+=3)
		{
			// Fetch the 3 vertices making this triangle
			ai = this.indices[ i ] * 3;
			bi = this.indices[ i + 1 ] * 3;
			ci = this.indices[ i + 2 ] * 3;

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
			nx = this.normals[i];
			ny = this.normals[i + 1];
			nz = this.normals[i + 2];

			var mag = Math.sqrt(nx * nx + ny * ny + nz * nz);

			this.normals[i] /= mag;
			this.normals[i + 1] /= mag;
			this.normals[i + 2] /= mag;
		}
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
