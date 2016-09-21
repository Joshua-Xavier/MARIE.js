(function() {

  // The Browser API key obtained from the Google Developers Console.
  var developerKey = 'AIzaSyCpcTAAL4Yf9WoKVD_UE6f-_LwE6bDau-M';

  // The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
  var clientId = "357044840397-qs7nu7a17ohiih95v334l6k209qh5oah.apps.googleusercontent.com"

  // Scope to use to access user's photos.
  var scope = ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/userinfo.profile'];

  var pickerApiLoaded = false;
  var oauthToken;

  // Preps the google login dropdown
  $(document).ready(function(){
      $('#googleDivider').hide();
      $('#nameLink').hide();
      $('#logOut').hide();
      $('#gdrive').show();
  });

  //When user presses logout, hide unnecessary information
  logOut = function() {
      $('#googleDivider').hide();
      $('#nameLink').hide();
      $('#logOut').hide();
      $('#gdrive').show();

  }

  // Use the API Loader script to load google.picker and gapi.auth.
  onApiLoad = function() {
    gapi.load('auth', {'callback': onAuthApiLoad});
    gapi.load('picker', {'callback': onPickerApiLoad});
    gapi.client.load('drive', 'v2');
  }

  onAuthApiLoad  = function() {
    window.gapi.auth.authorize(
        {
          'client_id': clientId,
          'scope': scope,
          'immediate': false
        },
        handleAuthResult);
  }

  onPickerApiLoad = function() {
    pickerApiLoaded = true;
    createPicker();
  }

  handleAuthResult  = function(authResult) {
    if (authResult && !authResult.error) {
      oauthToken = authResult.access_token;
      createPicker();
    }
  }

  /**
   * Google Picker Creation Handler.
   * @class gapi
   *
   * @return Returns Picker and Handles a callback once file is selected
   */
  createPicker  = function() {
    if (pickerApiLoaded && oauthToken) {
      var picker = new google.picker.PickerBuilder().
          addView(google.picker.ViewId.DOCS).
          setOAuthToken(oauthToken).
          setDeveloperKey(developerKey).
          setCallback(pickerCallback,oauthToken).
          build();

      picker.setVisible(true);
    }
  }

  /**
   * Google Picker Handler.
   * @class gapi
   *
   * @see createPicker
   * @param  {string} data       Passes authentication
   */
  pickerCallback  = function(data,accessToken) {
    var ID = 'nothing';
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
      var doc = data[google.picker.Response.DOCUMENTS][0];
      ID = doc[google.picker.Document.ID];
    }
    console.log(ID);
    readGFile(ID,accessToken);
  }

  /**
   * readGFile function
   * Load a file from Drive. Fetches both the metadata & content in parallel.
   *
   * @param {String} fileID ID of the file to load
   */
  readGFile  = function(fileId,accessToken) {
    var requestURL = "";
    var request = gapi.client.drive.files.get({
          'fileId': fileId,
          'alt': 'media'
      });
    request.execute(function(resp) {
      console.log('Title: ' + resp.title);
      console.log('Description: ' + resp.description);
      console.log('MIME type: ' + resp.mimeType);
      requestURL = resp.webContentLink;
    });
    console.log(request);
    console.log(getName());
    readCodebyURL(requestURL)
  }

  getName = function(){
     gapi.client.load('plus','v1', function(){
     var request = gapi.client.plus.people.get({
       'userId': 'me'
     });
     request.execute(function(resp) {
       name = resp.displayName
       console.log('Retrieved profile for:' + name);
       if(name !== 'undefined'){
         $('#nameLink').html('Hello ' + name);
         $('#nameLink').show();
         $('#googleDivider').show();
         $('#gdrive').hide();
         $('#logOut').show();
       } else if (name == 'undefined'){
         $('#nameLink').hide();
       }
     });
    })
  }

  //readCode() does a GET request for the the file based on the URL
  readCodebyURL = function(targetURL){
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
          if(xhr.readyState === 4){
              if(xhr.status == 200){
                  loadContents(xhr.responseText, xhr);
                  console.log('File Sucessfully Loaded');
              }
              else if(xhr.status == 404){
                  $('#warn-missing-file').show();
              }
          }
      };
      xhr.open('GET',targetURL,true);
      xhr.send();
  }

  //loadContents() works in conjunction with readCode(), if the server responds with a Code 200
  loadContents = function(responseText){
      programCodeMirror.setValue(responseText);
  }
}());
