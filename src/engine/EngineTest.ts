import { Engine } from "./Engine";
import { StatsHandler } from "../client/StatsHandler";
import { Shader } from "./Shader";
import { Material } from "./Material";
import { Geometry } from "./Geometry";
import { Mesh } from "./Mesh";
import { mat4 } from "gl-matrix";

export class EngineTest
{
	private engine : Engine;
	private mesh : Mesh;

	constructor()
	{
		this.init();
	}

	private async init()
	{
		let canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
		this.engine = new Engine(canvas);

		let vert = new Shader(Shader.ShaderType.VERTEX, await fetch("/content/shaders/simple.vs").then(r => r.text()));
		let frag = new Shader(Shader.ShaderType.FRAGMENT, await fetch("/content/shaders/simple.fs").then(r => r.text()));

		let material = new Material(vert, frag);

		let geometry = new Geometry();

		let mesh = new Mesh(geometry, material);

		this.mesh = mesh;

		requestAnimationFrame(() => this.loop());
	}

	private loop()
	{
		requestAnimationFrame(() => this.loop());
		StatsHandler.begin();
		this.engine.clear();
		let mat = mat4.create();
		mat4.perspective(mat, 90, 1, 0.1, 100);
		this.mesh.draw();
		StatsHandler.end();
	}
}
