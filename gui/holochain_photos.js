var url = undefined; //"ws://hcphotos.westus.cloudapp.azure.com:50000";
if (url == undefined) var holochain_connection = holochainclient.connect();
else var holochain_connection = holochainclient.connect({ url: url });

var maxSize = 5 * 1024 * 1024;

var photo = {
  name: "",
  data: ""
};

$(document).ready(function() {
  // console.log("document ready!");
  // console.log("get hello from holochain")
  // $(".loaderDiv").hide();
  $("#divBtnNew").hide();
  hello();
  arrangeSubmitVisibility();
  document
    .querySelector('input[type="file"]')
    .addEventListener("change", function() {
      if (this.files && this.files[0]) {
        var f = this.files[0];
        console.log(f);

        if (f.size > maxSize) {
          alert("Cannot Upload Photo, Maximum Allowed Size: ", maxSize);
          arrangeSubmitVisibility();
          return;
        }

        photo.name = f.name;

        $(".loaderDiv").show();
        var reader = new FileReader();
        reader.onload = (function(theFile) {
          return function(e) {
            var binaryData = e.target.result;
            var base64String = window.btoa(binaryData);
            // console.log(base64String);
            photo.data = base64String;
            arrangeSubmitVisibility();
            $(".loaderDiv").hide();
          };
        })(f);
        reader.readAsBinaryString(f);
      } else {
        photo = {
          name: "",
          data: ""
        };
        arrangeSubmitVisibility();
      }
    });

  $("#btnUpload").on("click", onUpload);
  $("#btnNew").on("click", onNew);
  $("#btnClear").on("click", onClear);
  $("#btnSourceCode").on("click", onSorceCode);
  $("#btnDonate").on("click", onDonate);
});

function onDonate() {
  window.location.href = "/donate.html";
}

function onSorceCode() {
  window.location.href = "https://github.com/ogu83/holochain_photos";
}

function onNew() {
  var origin = window.location.origin;
  window.location.href = origin;
}

function onUpload() {
  // console.log("onUpload");
  create_photo();
}

function onClear() {
  location.reload();
}

function isPhotoSelected() {
  return photo.name.length > 0 && photo.data.length > 0;
}

function arrangeSubmitVisibility() {
  $("#btnUpload").prop("disabled", !isPhotoSelected());
}

function showAddress() {
  var address = getUrlParameter("address");
  if (address != undefined) {
    $("#frmUpload").hide();
    $("#txtAddress").val(address);
    $("#divPhotoResult").show();
    get_photo();
  }
}

function hello() {
  $(".loaderDiv").show();
  holochain_connection.then(({ callZome, close }) => {
    callZome(
      "test-instance",
      "photos_zome",
      "hello_holo"
    )({ args: {} }).then(result => hello_callback(result));
  });
}
function hello_callback(result) {
  // console.log("hello_callback ", result);
  $(".loaderDiv").hide();
  result = JSON.parse(result);
  try {
    if (result.Ok === "Hello Holo") {
      // $('#alertHolochainSuccess').show()
      // $('#alertHolochainError').hide()
      showAddress();
      get_photos();
    }
  } catch (error) {
    $("#alertHolochainSuccess").hide();
    $("#alertHolochainError").show();
  }
}

function create_photo() {
  // console.log("oncreate_photo");
  $(".loaderDiv").show();
  holochain_connection.then(({ callZome, close }) => {
    callZome(
      "test-instance",
      "photos_zome",
      "create_photo"
    )({ photo: photo })
      .then(result => create_photo_callback(result))
      .catch(e => {
        console.log(e);
      });
  });
}
function create_photo_callback(result) {
  console.log("on_create_photo callback");
  console.log(result);
  var output = JSON.parse(result);
  if (output.Ok) {
    $("#txtAddress").val(output.Ok);

    $("#divPhotoResult").show();

    var origin = window.location.origin;
    var longUrl = origin + "/?address=" + output.Ok;
    $("#longUrl").text(longUrl);
    $("#longUrl").attr("href", longUrl);
    window.history.pushState(
      "object or string",
      "Title",
      "/?address=" + output.Ok
    );

    $("#txtName").val(photo.name);

    $("#imgPreview").attr("src", "data:image/png;base64," + photo.data);

    arrangeSubmitVisibility();
  }
  $(".loaderDiv").hide();
}

function get_photo() {
  var address = $("#txtAddress").val();
  $(".loaderDiv").show();
  holochain_connection.then(({ callZome, close }) => {
    callZome(
      "test-instance",
      "photos_zome",
      "get_photo"
    )({ address: address }).then(result => get_photo_callback(result));
  });
}
function get_photo_callback(result) {
  var output = JSON.parse(result);
  if (output.Ok) {
    photo = output.Ok;
    // console.log(photo);
    $("#txtDescription").hide();
    $("#divAddress").hide();
    $("#divLongUrl").hide();
    $("#divBtnNew").show();
    $("#txtName").val(photo.name);
    $("#imgPreview").attr("src", "data:image/png;base64," + photo.data);
  }
  $(".loaderDiv").hide();
}

function get_photos() {
  $(".loaderDiv").show();
  console.log("getting photos");
  holochain_connection.then(({ callZome, close }) => {
    callZome(
      "test-instance",
      "photos_zome",
      "get_photos"
    )({}).then(result => {
      console.log({ result });
      get_photos_callback(result);
    });
  });
}
function get_photos_callback(result) {
  var output = JSON.parse(result);
  if (output.Ok) {
    photos = output.Ok;
    console.log(photos);
    $("#divPhotosResult").val(photos.length + " photos for sharing.");
  }
  $(".loaderDiv").hide();
}

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
};
