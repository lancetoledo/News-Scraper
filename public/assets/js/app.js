$(document).ready(function(){
    let scraped = false;

    $("#scrape").click(function(){
        console.log("i have been clicked")
        scraped = true
        $.ajax("/scrape", {
          method: "GET"
        }).then(function(result){
          console.log(result)
          window.location.reload()
          $("#scrape-btn").css("color", "lightgray")
        })
      });

    
    $(document).on("click", ".article-title", function() {
        var id = $(this).attr("data-id");
          $.ajax("/articles/"+id, {
            method: "GET",
          }).then(function (data) {
              $("#notes").append("<h2>Notes</h2><br>");
              $("#notes").append("<h3><i>" + data.title + "</i></h3>");
              $("#notes").append("<input id='titleinput' name='title' placeholder='title'>");
              $("#notes").append("<textarea id='bodyinput' name='body' placeholder='notes'></textarea>");
              $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
              if (data.note) {
                $("#titleinput").val(data.note.title);
                $("#bodyinput").val(data.note.body);
              }

      })



      $(document).on("click", "#updatenote", function() {
        var thisId = $(this).attr("data-id");
    
        $.ajax({
          method: "POST",
          url: "/articles/" + thisId,
          data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val()
          }
        }).then(function(data) {
            console.log(data);
            $("#notes").empty();
            $("#titleinput").val("");
            $("#bodyinput").val("");
          });
      });
    });

    $(document).on("click", ".save", function() {
      var thisId = $(this).attr("data-id");
      console.log("i have been clicked");
     console.log(thisId);
      $.ajax({
        method: "POST",
        url: "/articles/saved/" + thisId,
        
      }).then(function(){
        console.log("save complete")
      })
    });

  $(document).on("click", ".addNote", function(){
    var thisId = $(this).attr("data-id");
      console.log("i have been clicked");
     console.log(thisId);
     $.ajax({
       method: "GET",
       url:"/note/" + thisId,

     }).then(function(note){
       console.log(note);
       $("#text-area").html(note);
      var btn = `<button type="button" class="btn btn-primary" id="saveChange" data-id="${thisId}" data-dismiss="modal">Save changes</button>`
      $("#noteButton").html(btn);
     })


  })

  $(document).on("click", "#saveChange",function(){
    console.log("clicked")
    var text = $("#text-area").val()
    var thisId = $(this).attr("data-id")
    console.log(text);
    $.ajax({
      method: "POST",
      url: "/notes/"+ thisId,
      data: {
        body: text
      }
    }).then(function(data) {
        console.log(data);
        $("#text-area").html(data);
        // $("#notes").empty();
        // $("#titleinput").val("");
        // $("#bodyinput").val("");
      });
  });
  



})
