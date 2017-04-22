// The MIT License (MIT)
//
// Copyright (c) 2012-2013 Mikola Lysenko
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Javascript Marching Cubes
 * Ported from Mikola Lysenko's https://github.com/mikolalysenko/mikolalysenko.github.com/blob/master/Isosurface/js/surfacenets.js
 * to TypeScript by Rasmus Israelsson
 */
export class SurfaceNet
{
	private static cubeEdges = new Int32Array(24);
	private static edgeTable = new Int32Array(256);
	private static buffer = new Int32Array(4096);

	public static march(data : any, dims : {x:number, y:number, z:number})
	{
		let vertices = [];
		let faces = [];
		let n = 0;
		let x = new Int32Array(3);
		let r = new Int32Array([1, dims.x + 1, (dims.x + 1) * (dims.y + 1)]);
		let grid = new Float32Array(8);
		let bufNo = 1;

		if (r[2] * 2 > SurfaceNet.buffer.length)
		{
			SurfaceNet.buffer = new Int32Array(r[2] * 2);
		}

		for (x[2] = 0; x[2] < dims.z - 1; x[2]++, n += dims.x, bufNo ^= 1, r[2] =- r[2]) {

			let m = 1 + (dims.x + 1) * (1 + bufNo * (dims.y + 1));

			for (x[1] = 0; x[1] < dims.y - 1; x[1]++, n++, m += 2)
			{
				for (x[0] = 0; x[0] < dims.x - 1; x[0]++, n++, m++)
				{
					let mask = 0;
					let g = 0;
					let idx = n;

					for(let k = 0; k < 2; k++, idx += dims.x * (dims.y - 2))
					{
						for(let j = 0; j < 2; j++, idx += dims.x-2)
						{
							for(let i = 0; i < 2; i++, g++, idx++)
							{
								let p = data[idx];
								grid[g] = p;
								mask |= (p < 0) ? (1<<g) : 0;
							}
						}
					}

					if (mask === 0 || mask === 0xff)
					{
						continue;
					}

					let edgeMask = SurfaceNet.edgeTable[mask];
					let v = [0.0, 0.0, 0.0];
					let eCount = 0;

					for (let i = 0; i < 12; i++)
					{
						if (!(edgeMask & (1<<i)))
						{
							continue;
						}

						eCount++;

						let e0 = SurfaceNet.cubeEdges[ i<<1 ];
						let e1 = SurfaceNet.cubeEdges[ (i<<1) + 1 ];
						let g0 = grid[e0];
						let g1 = grid[e1];
						let t = g0 - g1;

						if (Math.abs(t) > 1e-6)
						{
							t = g0 / t;
						}
						else
						{
							continue;
						}

						for (let j = 0, k = 1; j < 3; j++, k<<=1)
						{
							let a = e0 & k;
							let b = e1 & k;
							if (a !== b)
							{
								v[j] += a ? 1.0 - t : t;
							}
							else
							{
								v[j] += a ? 1.0 : 0;
							}
						}
					}

					let s = 1.0 / eCount;
					v[0] = (x[0] + s * v[0]) * (1 / (dims.x - 2)) - (0.5 / dims.x);		//VERTEX HERE
					v[1] = (x[1] + s * v[1]) * (1 / (dims.y - 2)) - (0.5 / dims.y);		//VERTEX HERE
					v[2] = (x[2] + s * v[2]) * (1 / (dims.z - 2)) - (0.5 / dims.z);		//VERTEX HERE

					SurfaceNet.buffer[m] = vertices.length;
					vertices.push(v);

					for (let i = 0; i < 3; i++)
					{
						if (!(edgeMask & (1<<i)) )
						{
							continue;
						}

						let iu = (i+1)%3;
						let iv = (i+2)%3;

						if (x[iu] === 0 || x[iv] === 0)
						{
							continue;
						}

						let du = r[iu];
						let dv = r[iv];

						let a = SurfaceNet.buffer[m];
						let c = SurfaceNet.buffer[m - du - dv];
						let b,d;

						if (mask & 1)
						{
							b = SurfaceNet.buffer[m - du];
							d = SurfaceNet.buffer[m - dv];
						}
						else	//Reversed
						{
							b = SurfaceNet.buffer[m - dv];
							d = SurfaceNet.buffer[m - du];
						}

						faces.push([a, b, c]);
						faces.push([a, c, d]);
					}
				}
			}
		}

		return { vertices : vertices, faces: faces };
	}

	public static prepare()
	{
		let k = 0;
		for (let i=0; i<8; i++)
		{
			for (let j=1; j<=4; j<<=1)
			{
				let p = i^j;
				if (i <= p)
				{
					SurfaceNet.cubeEdges[k++] = i;
					SurfaceNet.cubeEdges[k++] = p;
				}
			}
		}

		for (let i = 0; i<256; i++)
		{
			let em = 0;
			for (let j = 0; j < 24; j += 2)
			{
				let a = !!(i & (1<<SurfaceNet.cubeEdges[j]));
				let b = !!(i & (1<<SurfaceNet.cubeEdges[j + 1]));
				em |= a !== b ? (1 << (j >> 1)) : 0;
			}
			SurfaceNet.edgeTable[i] = em;
		}
	}
}