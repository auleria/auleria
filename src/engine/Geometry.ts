
import { Engine } from "./Engine";

export class Geometry
{
	public vertices : Float32Array;
	public vertexBuffer : WebGLBuffer;

	constructor()
	{
		let gl = Engine.GL;
		this.vertexBuffer = gl.createBuffer();

		this.vertices = new Float32Array([
			1.0,  1.0,  2.0,
			-1.0, 1.0,  2.0,
			1.0,  -1.0, 2.0,
			-1.0, -1.0, 2.0
		]);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
	}
}
