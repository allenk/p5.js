//Retained Mode. The default mode for rendering 3D primitives
//in WEBGL.
'use strict';

var p5 = require('../core/core');
var hashCount = 0;
/**
 * createBuffer description
 * @param  {String} gId    key of the geometry object
 * @param  {p5.Geometry}  obj contains geometry data
 */
p5.Renderer3D.prototype.createBuffer = function(gId, obj) {
  var gl = this.GL;
  this._setDefaultCamera();
  //initialize the gl buffers for our geom groups
  this._initBufferDefaults(gId, obj);
  //return the current shaderProgram from our material hash
  var shaderProgram = this.mHash[this._getCurShaderId()];
  //@todo rename this property
  //we mult the num geom faces by 3
  this.gHash[gId].numberOfItems = obj.faces.length * 3;
  //replace array with object loop since we're feeding a geom obj
  gl.bindBuffer(gl.ARRAY_BUFFER, this.gHash[gId].vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array( vToNArray(obj.vertices) ),
    gl.STATIC_DRAW);
  //vertex position Attribute
  shaderProgram.vertexPositionAttribute =
    gl.getAttribLocation(shaderProgram, 'aPosition');
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.gHash[gId].normalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array( vToNArray(obj.vertexNormals) ),
    gl.STATIC_DRAW);
  //vertex normal Attribute
  shaderProgram.vertexNormalAttribute =
    gl.getAttribLocation(shaderProgram, 'aNormal');
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  gl.vertexAttribPointer(
    shaderProgram.vertexNormalAttribute,
    3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.gHash[gId].uvBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array( flatten(obj.uvs) ),
    gl.STATIC_DRAW);
  //texture coordinate Attribute
  shaderProgram.textureCoordAttribute =
    gl.getAttribLocation(shaderProgram, 'aTexCoord');
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
  gl.vertexAttribPointer(
    shaderProgram.textureCoordAttribute,
    2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gHash[gId].indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array( flatten(obj.faces) ),
    gl.STATIC_DRAW);
};

/**
 * Draws a buffer given a geometry key ID
 * @param  {String} gId     ID in our geom hash
 * @return {p5.Renderer3D} this
 */
p5.Renderer3D.prototype.drawBuffer = function(gId) {
  this._setDefaultCamera();
  var gl = this.GL;
  var shaderKey = this._getCurShaderId();
  var shaderProgram = this.mHash[shaderKey];
  //vertex position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.gHash[gId].vertexBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    3, gl.FLOAT, false, 0, 0);
  //normal buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.gHash[gId].normalBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexNormalAttribute,
    3, gl.FLOAT, false, 0, 0);
  //uv buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.gHash[gId].uvBuffer);
  gl.vertexAttribPointer(
    shaderProgram.textureCoordAttribute,
    2, gl.FLOAT, false, 0, 0);
  //vertex index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gHash[gId].indexBuffer);
  this._setMatrixUniforms(shaderKey);
  gl.drawElements(
    gl.TRIANGLE_STRIP, this.gHash[gId].numberOfItems,
    gl.UNSIGNED_SHORT, 0);
  return this;
};

/**
 * _createBuffer
 * @param  {String} gId  key of the geometry object
 * @param  {Array}  arr  array holding bject containing geometry information
 */
p5.Renderer3D.prototype._initBufferDefaults = function(gId, arr) {
  //@TODO remove this limit on hashes in gHash
  hashCount ++;
  if(hashCount > 1000){
    var key = Object.keys(this.gHash)[0];
    delete this.gHash[key];
    hashCount --;
  }

  var gl = this.GL;
  //create a new entry in our gHash
  this.gHash[gId] = {};
  this.gHash[gId].vertexBuffer = gl.createBuffer();
  this.gHash[gId].normalBuffer = gl.createBuffer();
  this.gHash[gId].uvBuffer = gl.createBuffer();
  this.gHash[gId].indexBuffer = gl.createBuffer();
};

///////////////////////////////
//// UTILITY FUNCTIONS
//////////////////////////////
/**
 * turn a two dimensional array into one dimensional array
 * @param  {Array} arr 2-dimensional array
 * @return {Array}     1-dimensional array
 * [[1, 2, 3],[4, 5, 6]] -> [1, 2, 3, 4, 5, 6]
 */
function flatten(arr){
  return arr.reduce(function(a, b){
    return a.concat(b);
  });
}

/**
 * turn a p5.Vector Array into a one dimensional number array
 * @param  {Array} arr  an array of p5.Vector
 * @return {Array]}     a one dimensional array of numbers
 * [p5.Vector(1, 2, 3), p5.Vector(4, 5, 6)] ->
 * [1, 2, 3, 4, 5, 6]
 */
function vToNArray(arr){
  return flatten(arr.map(function(item){
    return [item.x, item.y, item.z];
  }));
}
module.exports = p5.Renderer3D;