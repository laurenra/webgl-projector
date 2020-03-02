# webgl-projector

Model a projector and screen in [WebGL](https://www.khronos.org/webgl/)
using the [three.js](https://threejs.org/) Javascript 3D library.

### To run this locally in a web browser using python3:

Run Python simple HTTP server from root of project directory:

(Linux/Mac)
```shell
python -m SimpleHTTPServer 8888
```
```
python3 -m http.server
```

(Windows)
```shell
python -m http.server 8888
```

- Access the page in a browser at http://localhost:8888/projector.html.
- You can reference everything in the project local directory as
subdirectories and files under localhost:8000.
- Stop the server with Ctrl+C.

## Create deployment tarball

To simplify deploying to a web server, use the **make-deployment-tar** 
script to create a tarball with all the files required.

1\. Run the script. 

```shell script
./make-deployment-tar
```

2\. Copy **webgl-projector.tar** to the server.

3\. Extract the files.

```shell script
tar xvf webgl-projector.tar
```

Update the script when you add files to the project that are 
required for deployment. 

## Tutorials and reference

[Mozilla WebGL reference](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)

[Mozilla WebGL tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial)

[Three.js tutorial](http://math.hws.edu/graphicsbook/c5/index.html)

[Intro to Computer graphics, OpenGL, WebGL, three.js, Blender](http://math.hws.edu/graphicsbook/index.html)

