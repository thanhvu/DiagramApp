"use strict";
/*
*  Copyright (C) 1998-2013 by Northwoods Software Corporation. All Rights Reserved.
*/

/**
* @constructor
* @extends CommandHandler
* @class 
* This CommandHandler class allows the user to position selected parts in a diagram
* relative to the first part selected, in addition to overriding the doKeyDown method
* of the CommandHandler for handling the arrow keys in additional manners.
*/
function DrawCommandHandler() {
  go.CommandHandler.call(this);
  this._arrowKeyBehavior = "move";
}
go.Diagram.inherit(DrawCommandHandler, go.CommandHandler);

/**
* This controls whether or not the user can invoke the {@link #alignLeft}, {@link #alignRight}, 
* {@link #alignTop}, {@link #alignBottom}, {@link #alignCenterX}, {@link #alignCenterY} commands.
* @this {DrawCommandHandler}
* @return {boolean}
* This returns true:
* if the diagram is not {@link Diagram#isReadOnly},
* if the model is not {@link Model#isReadOnly}, and
* if there are at least two selected {@link Part}s.
*/
DrawCommandHandler.prototype.canAlignSelection = function() {
  var diagram = this.diagram;
  if (diagram === null || diagram.isReadOnly || diagram.isModelReadOnly) return false;
  if (diagram.selection.count < 2) return false;
  return true;
};

/**
* Aligns selected parts along the left-most edge of the left-most part.
* @this {DrawCommandHandler}
*/
DrawCommandHandler.prototype.alignLeft = function() {
  var diagram = this.diagram;
  diagram.startTransaction("aligning left");
  var itr = diagram.selection.iterator;
  var minPosition = Infinity;
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    minPosition = Math.min(current.position.x, minPosition);
  }
  itr.reset();
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    current.move(new go.Point(minPosition, current.position.y));
  }
  diagram.commitTransaction("aligning left");
};

/**
* Aligns selected parts at the right-most edge of the right-most part.
* @this {DrawCommandHandler}
*/
DrawCommandHandler.prototype.alignRight = function() {
  myDiagram.startTransaction("aligning right");
  var itr = myDiagram.selection.iterator;
  var maxPosition = -Infinity;
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    var rightSideLoc = current.actualBounds.x + current.actualBounds.width;
    maxPosition = Math.max(rightSideLoc, maxPosition);
  }
  itr.reset();
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    current.move(new go.Point(maxPosition - current.actualBounds.width, current.position.y));
  }
  myDiagram.commitTransaction("aligning right");
};

/**
* Aligns selected parts at the top-most edge of the top-most part.
* @this {DrawCommandHandler}
*/
DrawCommandHandler.prototype.alignTop = function() {
  myDiagram.startTransaction("alignTop");
  var itr = myDiagram.selection.iterator;
  var minPosition = Infinity;
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    minPosition = Math.min(current.position.y, minPosition);
  }
  itr.reset();
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    current.move(new go.Point(current.position.x, minPosition));
  }
  myDiagram.commitTransaction("alignTop");
};

/**
* Aligns selected parts at the bottom-most edge of the bottom-most part.
* @this {DrawCommandHandler}
*/
DrawCommandHandler.prototype.alignBottom = function() {
  myDiagram.startTransaction("aligning bottom");
  var itr = myDiagram.selection.iterator;
  var maxPosition = -Infinity;
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    var bottomSideLoc = current.actualBounds.y + current.actualBounds.height;
    maxPosition = Math.max(bottomSideLoc, maxPosition);
  }
  itr.reset();
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    current.move(new go.Point(current.actualBounds.x, maxPosition - current.actualBounds.height));
  }
  myDiagram.commitTransaction("aligning bottom");
};

/**
* Aligns selected parts at the x-value of the center point of the first selected part. 
* @this {DrawCommandHandler}
*/
DrawCommandHandler.prototype.alignCenterX = function() {
  myDiagram.startTransaction("aligning Center X");
  var itr = myDiagram.selection.iterator;
  itr.next();
  var firstSelection = itr.value;
  var centerX = firstSelection.actualBounds.x + firstSelection.actualBounds.width / 2;
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    current.move(new go.Point(centerX - current.actualBounds.width / 2, current.actualBounds.y));
  }
  myDiagram.commitTransaction("aligning Center X");
};


/**
* Aligns selected parts at the y-value of the center point of the first selected part. 
* @this {DrawCommandHandler}
*/
DrawCommandHandler.prototype.alignCenterY = function() {
  myDiagram.startTransaction("aligning Center Y");
  var itr = myDiagram.selection.iterator;
  itr.next();
  var firstSelection = itr.value;
  var centerY = firstSelection.actualBounds.y + firstSelection.actualBounds.height / 2;
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    current.move(new go.Point(current.actualBounds.x, centerY - current.actualBounds.height / 2));
  }
  myDiagram.commitTransaction("aligning Center Y");
};

/**
* Aligns selected parts top-to-bottom in order of the order selected.
* Distance between parts can be specified. Default distance is 0.
* @this {DrawCommandHandler}
* @param distance 
*/
DrawCommandHandler.prototype.alignColumn = function(distance) {
  myDiagram.startTransaction("align Column");
  if (distance === undefined) distance = 0; // for aligning edge to edge
  distance = parseFloat(distance);
  var itr = myDiagram.selection.iterator;
  var selectedParts = new Array();
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    selectedParts.push(current);
  }
  for (var i = 0; i < selectedParts.length - 1; i++) {
    var current = selectedParts[i];
    // adds distance specified between parts
    var curBottomSideLoc = current.actualBounds.y + current.actualBounds.height + distance;
    var next = selectedParts[i + 1];
    next.move(new go.Point(current.actualBounds.x, curBottomSideLoc));
  }
  myDiagram.commitTransaction("align Column");
};

/**
* Aligns selected parts left-to-right in order of the order selected.
* Distance between parts can be specified. Default distance is 0.
* @this {DrawCommandHandler}
* @param distance 
*/
DrawCommandHandler.prototype.alignRow = function(distance) {
  if (distance === undefined) distance = 0; // for aligning edge to edge
  distance = parseFloat(distance);
  myDiagram.startTransaction("align Row");
  var itr = myDiagram.selection.iterator;
  var selectedParts = new Array();
  while (itr.next()) {
    var current = itr.value;
    if (current instanceof go.Link) continue; // skips over go.Link
    selectedParts.push(current);
  }
  for (var i = 0; i < selectedParts.length - 1; i++) {
    var current = selectedParts[i];
    // adds distance specified between parts
    var curRightSideLoc = current.actualBounds.x + current.actualBounds.width + distance;
    var next = selectedParts[i + 1];
    next.move(new go.Point(curRightSideLoc, current.actualBounds.y));
  }
  myDiagram.commitTransaction("align Row");
};


/**
* Change the angle of the parts connected with the given part. This is in the command handler
* so it can be easily accessed for the purpose of creating commands that change the rotation of a part. 
* @this {DrawCommandHandler}
* @param {number=} angle the positive (clockwise) or negative (counter-clockwise) change in the rotation angle of each Part, in degrees.
*/
DrawCommandHandler.prototype.rotate = function(angle) {
  if (angle === undefined) angle = 90;
  myDiagram.startTransaction("rotate " + angle.toString());
  var diagram = this.diagram;
  var itr = diagram.selection.iterator;
  while (itr.next()) {
    var p = itr.value;
    if (p instanceof go.Link || p instanceof go.Group) continue;  // can't do Links!
    p.angle += angle;
  }
  myDiagram.commitTransaction("rotate " + angle.toString());
};


/**
* Overrides a few of the default CommandHandler keys.
* for key-down events that are not overriden, it calls the CommandHandler base method.
* @this {DrawCommandHandler}*/
DrawCommandHandler.prototype.doKeyDown = function() {
  var diagram = this.diagram;
  if (diagram === null) return;
  var e = diagram.lastInput;

  // determines the function of the arrow keys
  if (e.key === "Up" || e.key === "Down" || e.key === "Left" || e.key === "Right") {
    var behavior = this.arrowKeyBehavior;
    if (behavior == "select") {
      this.arrowKeySelect();
      return;
    } else if (behavior == "move") {
      this.arrowKeyMove();
      return;
    }
    // otherwise drop through to get the default behavior
  }

  // otherwise still does all standard commands
  go.CommandHandler.prototype.doKeyDown.call(this);
};

// when we need to work on a single part, this returns the first selected part
DrawCommandHandler.prototype.getCurrentPart = function() {
  return this.diagram.selection.first();
};

// collects all of the parts currently in the diagram in an array 
DrawCommandHandler.prototype.getAllParts = function() {
  var allParts = new Array();
  var itr = this.diagram.nodes;
  while (itr.next()) {
    allParts.push(itr.value);
  }
  itr = this.diagram.parts;
  while (itr.next()) {
    allParts.push(itr.value);
  }
  return allParts;
};

// to be called when arrowKeyBehavior = arrowKeyMove
DrawCommandHandler.prototype.arrowKeyMove = function() {
  var diagram = this.diagram;
  var e = diagram.lastInput;
  // moves all selected parts in the specified direction
  var vdistance = 0;
  var hdistance = 0;
  // if control is being held down, move pixel by pixel. Else, moves by grid cell size    
  if (e.control) {
    vdistance = 1;
    hdistance = 1;
  } else if (diagram.grid !== null) {
    var cellsize = diagram.grid.gridCellSize;
    hdistance = cellsize.width;
    vdistance = cellsize.height;
  }
  diagram.startTransaction("arrowKeyMove");
  var itr = diagram.selection.iterator;
  while (itr.next()) {
    var part = itr.value;
    if (e.key === "Up") {
      part.move(new go.Point(part.actualBounds.x, part.actualBounds.y - vdistance));
    } else if (e.key === "Down") {
      part.move(new go.Point(part.actualBounds.x, part.actualBounds.y + vdistance));
    } else if (e.key === "Left") {
      part.move(new go.Point(part.actualBounds.x - hdistance, part.actualBounds.y));
    } else if (e.key === "Right") {
      part.move(new go.Point(part.actualBounds.x + hdistance, part.actualBounds.y));
    }
  }
  diagram.commitTransaction("arrowKeyMove");
};

// to be called when arrowKeyBehavior = arrowKeySelect 
DrawCommandHandler.prototype.arrowKeySelect = function() {
  var diagram = this.diagram;
  var e = diagram.lastInput;
  // with a part selected, arrow keys change the selection
  // arrow keys + shift selects the additional part in the specified direction
  // arrow keys + control toggles the selection of the additional part
  var nextPart = null;
  if (e.key === "Up") {
    nextPart = this.findPartUp();
  } else if (e.key === "Down") {
    nextPart = this.findPartDown();
  } else if (e.key === "Left") {
    nextPart = this.findPartLeft();
  } else if (e.key === "Right") {
    nextPart = this.findPartRight();
  }
  if (nextPart != null) {
    if (e.shift) {
      nextPart.isSelected = true;
    } else if (e.control) {
      nextPart.isSelected = !nextPart.isSelected;
    } else {
      diagram.select(nextPart);
    }
  }
};

// finds the angle between two parts, with the upper L corner of the selected part acting as the origin
DrawCommandHandler.prototype.findAngle = function(centerPoint, satellitePoint) {
  var x = centerPoint.x;
  var xprime = satellitePoint.x
  var y = centerPoint.y;
  var yprime = satellitePoint.y;
  var deltaY = y - yprime;
  var deltaX = x - xprime;
  var theta = 0;
  // calculates theta based on various placements of the satellite part
  if ((xprime < x && yprime < y))
    theta = Math.PI - Math.atan(deltaY / deltaX);
  else if (xprime < x && yprime > y)
    theta = Math.PI - Math.atan(deltaY / deltaX);
  else if (xprime > x && yprime < y)
    theta = -Math.atan(deltaY / deltaX);
  else if (xprime > x && yprime > y)
    theta = (2 * Math.PI) - Math.atan(deltaY / deltaX);
    // if detlaX or deltaY are zero 
  else if (deltaX == 0 && yprime < y) theta = Math.PI / 2;
  else if (deltaX == 0 && yprime > y) theta = Math.PI * (3 / 2);
  else if (deltaY == 0 && xprime > x) theta = 0;
  else if (deltaY == 0 && xprime < x) theta = Math.PI;
  // converts radians to degrees 
  theta = theta * (180 / Math.PI);
  return theta;
};

// finds a part in the specified direction
DrawCommandHandler.prototype.findPartUp = function() {
  var allParts = this.getAllParts();
  var originalPart = this.getCurrentPart();
  var originalPoint = new go.Point(originalPart.actualBounds.x, originalPart.actualBounds.y);
  var closestDistance = Infinity;
  // if no parts meet the criteria, the same part remains selected
  var closest = originalPart;

  // "up" part is the closest one between 45 and 135 degrees
  for (var i = 0; i < allParts.length; i++) {
    var nextPart = allParts[i];
    if (nextPart === originalPart) continue; // skips over currently selected part
    var nextPoint = new go.Point(nextPart.actualBounds.x, nextPart.actualBounds.y);
    var angle = this.findAngle(originalPoint, nextPoint);
    if (angle > 45 && angle < 135) {
      var distance = originalPoint.distanceSquaredPoint(nextPoint);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = nextPart;
      }
    }
  }
  return closest;
};

DrawCommandHandler.prototype.findPartDown = function() {
  var allParts = this.getAllParts();
  var originalPart = this.getCurrentPart();
  var originalPoint = new go.Point(originalPart.actualBounds.x, originalPart.actualBounds.y);
  var closestDistance = Infinity;
  // if no parts meet the criteria, the same part remains selected
  var closest = originalPart;

  // "up" part is the closest one between 225 and 315 degrees
  for (var i = 0; i < allParts.length; i++) {
    var nextPart = allParts[i];
    if (nextPart === originalPart) continue; // skips over currently selected part
    var nextPoint = new go.Point(nextPart.actualBounds.x, nextPart.actualBounds.y);
    var angle = this.findAngle(originalPoint, nextPoint);
    if (angle > 225 && angle < 315) {
      var distance = originalPoint.distanceSquaredPoint(nextPoint);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = nextPart;
      }
    }
  }
  return closest;
};

DrawCommandHandler.prototype.findPartLeft = function() {
  var allParts = this.getAllParts();
  var originalPart = this.getCurrentPart();
  var originalPoint = new go.Point(originalPart.actualBounds.x, originalPart.actualBounds.y);
  var closestDistance = Infinity;
  // if no parts meet the criteria, the same part remains selected
  var closest = originalPart;

  // "up" part is the closest one between 135 and 225 degrees
  for (var i = 0; i < allParts.length; i++) {
    var nextPart = allParts[i];
    if (nextPart === originalPart) continue; // skips over currently selected part 
    var nextPoint = new go.Point(nextPart.actualBounds.x, nextPart.actualBounds.y);
    var angle = this.findAngle(originalPoint, nextPoint);
    if (angle >= 135 && angle <= 225) {
      var distance = originalPoint.distanceSquaredPoint(nextPoint);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = nextPart;
      }
    }
  }
  return closest;
};

DrawCommandHandler.prototype.findPartRight = function() {
  var allParts = this.getAllParts();
  var originalPart = this.getCurrentPart();
  var originalPoint = new go.Point(originalPart.actualBounds.x, originalPart.actualBounds.y);
  var closestDistance = Infinity;
  // if no parts meet the criteria, the same part remains selected
  var closest = originalPart;

  // "up" part is the closest one between 315 and 45 degrees
  for (var i = 0; i < allParts.length; i++) {
    var nextPart = allParts[i];
    if (nextPart === originalPart) continue; // skips over currently selected part 
    var nextPoint = new go.Point(nextPart.actualBounds.x, nextPart.actualBounds.y);
    var angle = this.findAngle(originalPoint, nextPoint);
    if (angle <= 45 || angle >= 315) {
      var distance = originalPoint.distanceSquaredPoint(nextPoint);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = nextPart;
      }
    }
  }
  return closest;
};

/**
* Gets or sets the arrow key behavior. Possible values are "move", "select", and "scroll".  
* The default value is "move".
* @name DrawCommandHandler#arrowKeyBehavior
* @function.
* @return {string}
*/
Object.defineProperty(DrawCommandHandler.prototype, "arrowKeyBehavior", {
  get: function() { return this._arrowKeyBehavior; },
  set: function(val) {
    if (val != "move" && val != "select" && val != "scroll") throw new Error("DrawCommandHandler.arrowKeyBehavior must be either \"move\",\"select\", or \"scroll\".");
    this._arrowKeyBehavior = val;
  }
});
