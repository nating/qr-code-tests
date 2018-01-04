/*

CustomQRCode.js

This is a Customisable QR Code Component for React Native Applications.

  --Geoff Natin 08/7/17 21:49

*/


//-----------------------------Imports-----------------------------------
import React, { Component } from 'react';
import { View, Image, Text, Button } from 'react-native';
import PropTypes from 'prop-types';
import { generateQRCode } from './QRCodeGenerator.js';
import Svg, { Rect, Circle, Polygon, G, Path, Defs, ClipPath, LinearGradient, Stop } from 'react-native-svg'

//-----------------------------Component---------------------------------
export default class CustomQRCode extends Component {

//-----------------------Properties---------------------
  static propTypes = {
    content: PropTypes.string,
    size: PropTypes.number,
    padding: PropTypes.number,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    codeStyle: PropTypes.string,
    logo: Image.propTypes.source,
    logoSize: PropTypes.number,
    ecl: PropTypes.oneOf(['L', 'M', 'Q', 'H'])
  };

  static defaultProps = {
    content: "https://i-love-qr-codes.com",
    size: 250,
    padding: 1,
    color: 'black',
    backgroundColor: 'white',
    codeStyle: 'sharp',
    logoSize: 100,
    ecl: 'H'
  };

//---------------------Constructor---------------------
   constructor(props) {
      super();
      this.state = {
        pieces: (<View></View>)
      }
   }

   componentDidMount(){
     this.setState({pieces:this.getPieces()});
   }

//-----------------------Methods-----------------------

  //Returns an array of SVG Elements that represent the pieces of the QR Code
   getPieces(){
     var qr = generateQRCode(this.props);

     var modules = qr.qrcode.modules;

     var size = this.props.size;
     var length = modules.length;
     var xsize = size / (length + 2 * this.props.padding);
     var ysize = size / (length + 2 * this.props.padding);

     var pieces = [];
     var nonPieces = [];

     //Add the SVG element of each piece in the body of the QR Code
     for (var y = 0; y < length; y++) {
       for (var x = 0; x < length; x++) {
         var module = modules[x][y];
         if (module) {
           pieces.push(this.getPiece(x,y,modules));
         }
         else{
           nonPieces.push(this.getPiece(x,y,modules));
         }
       }
     }

     //TODO: this if statement is a temporary fix for removing pieces from logo area
     if(this.props.logo){
       return (
           <Svg style={{backgroundColor:this.props.backgroundColor,height:this.props.size,width:this.props.size}}>
             {pieces}
             <Rect x={((this.props.size/2)-(this.props.logoSize/2))} y={((this.props.size/2)-(this.props.logoSize/2))} width={this.props.logoSize} height={this.props.logoSize} fill={this.props.backgroundColor}/>
           </Svg>
       );
     }
     else{
       return (
           <Svg style={{backgroundColor:this.props.backgroundColor,height:this.props.size,width:this.props.size}}>
            <Defs>
              <ClipPath id="clip">
                {pieces}
              </ClipPath>
              <LinearGradient id="grad" x1="0" y1="0" x2="170" y2="0">
                  <Stop offset="0" stopColor="rgb(255,0,0)" stopOpacity="1" />
                  <Stop offset="1" stopColor="rgb(0,0,255)" stopOpacity="1" />
              </LinearGradient>
            </Defs>
               <Rect clipPath="url(#clip)" fill='red' x={0} y={0} height='100%' width='100%' fill="url(#grad)"/>
           </Svg>
       );
     }
   }

   //Returns an SVG Element that represents the piece of the QR code at modules[x][y]
   getPiece(x,y,modules){

     //Find out which piece type it is
     var pieceProps = this.getPieceProperties(x,y,modules);
     return this.drawPiece(x,y,modules,pieceProps);

   }

    //Returns an object with orientation and pieceType representation of the piece type. (See https://github.com/mpaolino/qrlib/tree/master/qrlib/static)
    getPieceProperties(x,y,modules){
      var mod_matrix = {};
      mod_matrix.topLeft = (x!=0 && y!=0 && modules[x-1][y-1]);
      mod_matrix.top = (y!=0 && modules[x][y-1]);
      mod_matrix.topRight = (x!=modules.length-1 && y!=0 && modules[x+1][y-1]);
      mod_matrix.left = (x!=0 && modules[x-1][y]);
      mod_matrix.right = (x!=modules.length-1 && modules[x+1][y]);
      mod_matrix.bottomLeft = (x!=0 && y!=modules.length-1 && modules[x-1][y+1]);
      mod_matrix.bottom = (y!=modules.length-1 && modules[x][y+1]);
      mod_matrix.bottomRight = (x!=modules.length-1 && y!=modules.length-1 && modules[x+1][y+1]);

      //  (surroundingCount holds the number of pieces above or to the side of this piece)
      var surroundingCount = 0;
      if(mod_matrix.top){surroundingCount++;}
      if(mod_matrix.left){surroundingCount++;}
      if(mod_matrix.right){surroundingCount++;}
      if(mod_matrix.bottom){surroundingCount++;}

      var pieceProperties = {};
      var orientation = 0;

      //Determine what the piece properties are from its surrounding pieces.
      //  (surroundingCount holds the number of pieces above or to the side of this piece)
      //  (See https://github.com/mpaolino/qrlib/tree/master/qrlib/static)
      switch(surroundingCount){
        case 0:
          pieceProperties.pieceType = '1a';
          if(mod_matrix.right){orientation=90;}
          else if(mod_matrix.bottom){orientation=180;}
          else if(mod_matrix.left){orientation=270;}
          pieceProperties.orientation = orientation;
          return pieceProperties;
        case 1:
          pieceProperties.pieceType = '2b';
          pieceProperties.orientation = 0;
          return pieceProperties;
        case 2:
          if( (mod_matrix.top && mod_matrix.bottom) || (mod_matrix.left && mod_matrix.right) ){
            var orientation = (mod_matrix.top && mod_matrix.bottom) ? 0 : 90;
            pieceProperties.pieceType = '1b3b';
            pieceProperties.orientation = orientation;
            return pieceProperties;
          }
          else{
            var orientation = 0;
            if(mod_matrix.top && mod_matrix.right){pieceProperties.orientation=90; pieceProperties.pieceType = mod_matrix.topRight ? '2a1b1a' : '2a1b'; return pieceProperties;}
            else if(mod_matrix.right && mod_matrix.bottom){pieceProperties.orientation=180; pieceProperties.pieceType = mod_matrix.bottomRight ? '2a1b1a' : '2a1b'; return pieceProperties;}
            else if(mod_matrix.left && mod_matrix.bottom){pieceProperties.orientation=270; pieceProperties.pieceType = mod_matrix.bottomLeft ? '2a1b1a' : '2a1b'; return pieceProperties;}
            else{ pieceProperties.pieceType = mod_matrix.topLeft ? '2a1b1a' : '2a1b'; return pieceProperties;}
          }
        case 3:
          pieceProperties.pieceType = '2a1b2c';
          var orientation = 0;
          if(mod_matrix.top && mod_matrix.right && mod_matrix.bottom){orientation=90;}
          else if(mod_matrix.right && mod_matrix.bottom && mod_matrix.left){orientation=180;}
          else if(mod_matrix.bottom && mod_matrix.left && mod_matrix.top){orientation=270;}
          pieceProperties.orientation = orientation;
          return pieceProperties;
        case 4:
          pieceProperties.pieceType = '2a1b2c3b';
          pieceProperties.orientation = 0;
          return pieceProperties;
      }
    }

    //Returns an SVG Element for a piece in the style of the codeStyle
    drawPiece(x,y,modules,pieceProperties){
      switch(this.props.codeStyle){
        case 'square':
          return this.drawSquarePiece(x,y,modules,pieceProperties);
        case 'circle':
          return this.drawCirclePiece(x,y,modules,pieceProperties);
        case 'dot':
          return this.drawDotPiece(x,y,modules,pieceProperties);
        case 'diamond':
          return this.drawDiamondPiece(x,y,modules,pieceProperties);
        case 'sharp':
          return this.drawSharpPiece(x,y,modules,pieceProperties);
        case 'ninja':
          return this.drawNinjaPiece(x,y,modules,pieceProperties);
        default:
          return this.drawSquarePiece(x,y,modules,pieceProperties);
      }
    }

    //Returns an SVG Element for a piece of the 'square' codeStyle
    drawSquarePiece(x,y,modules,pieceProperties){
      var length = modules.length;
      var width = this.props.size;
      var height = this.props.size;
      var xsize = width / (length + 2 * this.props.padding);
      var ysize = height / (length + 2 * this.props.padding);
      var px = (x * xsize + this.props.padding * xsize);
      var py = (y * ysize + this.props.padding * ysize);
      return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={this.props.color} />);
    }

    //Returns an SVG Element for a piece of the 'circle' codeStyle
    drawCirclePiece(x,y,modules,pieceProperties){
      var length = modules.length;
      var width = this.props.size;
      var height = this.props.size;
      var xsize = width / (length + 2 * this.props.padding);
      var ysize = height / (length + 2 * this.props.padding);
      var px = (x * xsize + this.props.padding * xsize)+xsize/2;
      var py = (y * ysize + this.props.padding * ysize)+ysize/2;
      return (<Circle key={px+':'+py} cx={px} cy={py} r={xsize/2} fill={this.props.color} />);
    }

    //Returns an SVG Element for a piece of the 'circle' codeStyle
    drawDotPiece(x,y,modules,pieceProperties){
      var length = modules.length;
      var width = this.props.size;
      var height = this.props.size;
      var xsize = width / (length + 2 * this.props.padding);
      var ysize = height / (length + 2 * this.props.padding);
      var px = (x * xsize + this.props.padding * xsize)+xsize/2;
      var py = (y * ysize + this.props.padding * ysize)+ysize/2;
      return (<Circle key={px+':'+py} cx={px} cy={py} r={xsize/3} fill={this.props.color} />);
    }

    //Returns an SVG Element for a piece of the 'square' codeStyle
    drawDiamondPiece(x,y,modules,pieceProperties){
      var length = modules.length;
      var width = this.props.size;
      var height = this.props.size;
      var xsize = width / (length + 2 * this.props.padding);
      var ysize = height / (length + 2 * this.props.padding);
      var px = (x * xsize + this.props.padding * xsize);
      var py = (y * ysize + this.props.padding * ysize);
      return (<G x={px+xsize/2} y={py+ysize/2} width={xsize} height={ysize}><Rect key={px+':'+py} x={-xsize/2} y={-ysize/2} width={xsize} height={ysize} rotate={45} fill={this.props.color} /></G>);
    }

    //Returns an SVG Element for a piece of the 'ninja' codeStyle
    drawSharpPiece(x,y,modules,pieceProperties){

      var orientation = pieceProperties.orientation;
      var pieceType = pieceProperties.pieceType;
      var width = this.props.size;
      var height = this.props.size;
      var length = modules.length;
      var xsize = width / (length + 2 * this.props.padding);
      var ysize = height / (length + 2 * this.props.padding);
      var px = (x * xsize + this.props.padding * xsize);
      var py = (y * ysize + this.props.padding * ysize);

      // !!!! These aren't the proper paths yet
      var str = (xsize)+','+0+' '+(xsize)+','+(ysize)+' '+0+','+(ysize);
      var rotationStr = orientation+', '+(xsize/2)+', '+(ysize/2);

      switch(pieceType){
        case '1a':
          return (<Circle key={px+':'+py} cx={px+xsize/2} cy={py+ysize/2} r={xsize/2} fill={this.props.color} />);
        case '2b':
          return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={this.props.color} />);
        case '1b3b':
          return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={this.props.color} />);
        case '2a1b':
          return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={this.props.color} />);
        case '2a1b1a':
          return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={this.props.color} />);
        case '2a1b2c':
          return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={this.props.color} />);
        case '2a1b2c3b':
          return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={this.props.color} />);
        default:
          return (<Rect key={px+':'+py} x={px} y={py} width={xsize} height={ysize} fill={this.props.color} />);
      }
    }

    //Returns an SVG Element for a piece of the 'ninja' codeStyle
    drawNinjaPiece(x,y,modules,pieceProperties){

      var orientation = pieceProperties.orientation;
      var pieceType = pieceProperties.pieceType;
      var width = this.props.size;
      var height = this.props.size;
      var length = modules.length;
      var xsize = width / (length + 2 * this.props.padding);
      var ysize = height / (length + 2 * this.props.padding);
      var px = (x * xsize + this.props.padding * xsize);
      var py = (y * ysize + this.props.padding * ysize);

      // !!!! These aren't the proper paths yet
      switch(pieceType){
        case '2b':
          return (<Rect x={-(xsize/2)} y={-(ysize/2)} originX={(px+xsize/2)} originY={(py+ysize/2)} rotate={orientation} width={xsize} height={ysize} fill={this.props.color} />);
        case '1b':
          return (<Rect x={-(xsize/2)} y={-(ysize/2)} originX={(px+xsize/2)} originY={(py+ysize/2)} rotate={orientation} width={xsize} height={ysize} fill={this.props.color} />);
        case '1b3b':
          return (<Rect x={-(xsize/2)} y={-(ysize/2)} originX={(px+xsize/2)} originY={(py+ysize/2)} rotate={orientation} width={xsize} height={ysize} fill={this.props.color} />);
        case '2a1b':
          return (<Rect x={-(xsize/2)} y={-(ysize/2)} originX={(px+xsize/2)} originY={(py+ysize/2)} rotate={orientation} width={xsize} height={ysize} fill={this.props.color} />);
        case '2a1b1a':
          return (<Rect x={-(xsize/2)} y={-(ysize/2)} originX={(px+xsize/2)} originY={(py+ysize/2)} rotate={orientation} width={xsize} height={ysize} fill={this.props.color} />);
        case '2a1b2c':
          return (<Rect x={-(xsize/2)} y={-(ysize/2)} originX={(px+xsize/2)} originY={(py+ysize/2)} rotate={orientation} width={xsize} height={ysize} fill={this.props.color} />);
        case '2a1b2c3b':
          return (<Rect x={-(xsize/2)} y={-(ysize/2)} originX={(px+xsize/2)} originY={(py+ysize/2)} rotate={orientation} width={xsize} height={ysize} fill={this.props.color} />);
        default:
          return (<Rect x={-(xsize/2)} y={-(ysize/2)} originX={(px+xsize/2)} originY={(py+ysize/2)} rotate={orientation} width={xsize} height={ysize} fill={this.props.color} />);
      }
    }

  //---------------------Rendering-----------------------
    //This component is made up of a view with an SVG of a QR Code, and optionally
    //  a logo rendered on top of it.
    render () {
      if(this.props.logo){
        return(
          <View>
            {this.state.pieces}
              <Image source={this.props.logo} style={{width: this.props.logoSize, height: this.props.logoSize, position: 'absolute', left: ((this.props.size/2)-(this.props.logoSize/2)), top: ((this.props.size/2)-(this.props.logoSize/2))}}/>
          </View>
        )
      }
      else{
        return (
          <View>
              {this.state.pieces}
            </View>
        )
      }
    }
}
