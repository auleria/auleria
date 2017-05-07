
import { GameObject } from "../GameObject";
import { Map2 } from "../../Map2";

export class QuadTreeTerrain extends GameObject
{
	private tree : Map2<number, number, Quad>;

	private poi : THREE.Vector3;
	private t = 0;

	private mesh : THREE.Mesh;

	public clientInitialize()
	{
		this.tree = new Map2<number, number, Quad>();
		this.tree.set(0, 0, new Quad(null, 0));
		this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshNormalMaterial());
		this.world.scene.add(this.mesh);
		this.poi = this.mesh.position;
		this.poi.z = 2;
	}

	public update()
	{
		this.t += 0.02;
		this.poi.x = Math.cos(this.t) * 32;
		this.poi.y = Math.sin(this.t) * 32;
		this.tree.forEach(quad => this.handleQuad(quad));
	}

	public handleQuad(quad : Quad)
	{
		let dist = quad.position.clone().addScalar(quad.size / 2).distanceTo(this.poi);
		if (dist < 256 >> quad.depth && quad.depth < 5)
		{
			if (quad.value)
			{
				this.world.scene.remove(quad.value);
				quad.value = null;
			}
			quad.forEach(quad => this.handleQuad(quad));
		}
		else
		{
			if (!quad.value)
			{
				let geom = new THREE.Geometry();
				geom.vertices.push(new THREE.Vector3(0, 0));
				geom.vertices.push(new THREE.Vector3(1, 0));
				geom.vertices.push(new THREE.Vector3(1, 1));
				geom.vertices.push(new THREE.Vector3(0, 1));
				geom.vertices.push(new THREE.Vector3(0, 0));
				let mesh = new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0xffffff}));
				mesh.position.copy(quad.position);
				mesh.scale.multiplyScalar(quad.size);
				this.world.scene.add(mesh);
				quad.value = mesh;
			}

			if (quad.hasChildren)
			{
				quad.deepForEach(child => {
					this.world.scene.remove(child.value);
				});
				quad.hasChildren = false;
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

	constructor(parent : Quad, n : number)
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
			this.position = new THREE.Vector3(- 128 / 2, -128 / 2);
			this.size = 128;
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
