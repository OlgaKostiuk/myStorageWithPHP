<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>File storage</title>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <script src="HistoryIterator.js"></script>
    <script src="ContextMenu.js"></script>
    <script src="ModalDialog.js"></script>
    <script src="script.js"></script>
    <link rel="stylesheet" href="style.css">

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>

<body>

<!--Navigation menu-->
<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">Storage</a>
        </div>
        <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav">
                <li class="active"><a href="index.php">Home</a></li>
            </ul>
        </div><!--/.nav-collapse -->
    </div>
</div>

<!--Storage toolbar-->
<div class="btn-group btn-group-justified">
    <a href="#" id="up" class="btn btn-primary disabled">Up</a>
    <a href="#" id="back" class="btn btn-primary disabled">Back</a>
    <a href="#" id="forward" class="btn btn-primary disabled">Forward</a>
    <a href="#" id="newFolder" class="btn btn-primary">New folder</a>
    <!--    <a href="#" id="test" class="btn btn-primary">Test</a>-->
</div>

<!--Modal dialog template-->
<div id="templateContainer" style="display: none">
    <div class="modal fade modalDialog" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header" style="padding:35px 50px;">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modalDialogHeader">Header</h4>
                </div>
                <div class="modal-body" style="padding:40px 50px;">
                    <div class="form-group">
                        <label for="modalDialogInput" class="modalDialogLabel">Label</label>
                        <input type="text" class="form-control modalDialogInput">
                    </div>
                    <button class="btn btn-primary btn-block modalDialogOK">OK</button>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-default btn-default pull-left modalDialogCancel" data-dismiss="modal"><span
                                class="glyphicon glyphicon-remove"></span> Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!--Opened directory content-->
<div class="container">

    <h1>File storage</h1>
    <p>Right click on item to open context menu, left click on directory to open it</p>
    <div class="dirInfo form-group">
        <label for="currentPath">Current path:</label>
        <input type="text" name="name" id="currentPath" class="form-control" value="" title="">
    </div>

    <div class="dirInfo form-group">
        <form id="upload" method="post" class="form-horizontal" enctype="multipart/form-data">
            <label for="file" class="control-label">Choose a file to upload to the current directory:</label>
            <input type="hidden" name="MAX_FILE_SIZE" value="7000000"/>
            <input type="file" class="" name="file" id="file" required="required">
            <button type="submit" class="btn btn-primary">Upload</button>
        </form>
        <div id="output"></div>
    </div>

    <div class="table-responsive">
        <table class="table table-hover">
            <thead>
            <tr>
                <th>Name</th>
                <th>Date modified</th>
                <th>Size</th>
            </tr>
            </thead>
            <tbody id="content">
            </tbody>
        </table>
    </div>

</div>

</body>
</html>