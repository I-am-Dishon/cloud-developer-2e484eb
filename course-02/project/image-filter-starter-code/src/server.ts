import express from 'express';
import bodyParser from 'body-parser';
const fs = require("fs");
import { resolve } from 'path';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
const imageFolder = './src/util/tmp/';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  app.get( "/filteredimage", async ( req, res ) => {

    try{
      let {image_url} = req.query;
      if(!image_url){
        return res.status(400).send("bad request!");
      }
      console.log(image_url);
      const path = await filterImageFromURL(image_url);
      res.sendFile(path);

      var files = []
  
      fs.readdirSync(imageFolder).forEach((file: any) => {
        var ow = imageFolder + file
        var realPath = resolve(ow);
        files.push(realPath)
      });

      res.on('finish', () => deleteLocalFiles([path]));
    } catch {
      return res.status(500).send({error: 'Unable to process your request'});
    }

  } );
  // Root Endpoint
  // Displays a simple message to the user

  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();