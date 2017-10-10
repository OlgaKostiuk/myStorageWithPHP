(function () {
    var storage;
    var history = new HistoryIterator();
    var menu = new ContextMenu();
    var uploadForm;
    var uploadOutput;

    var controllerActions = {
        load: 'load',
        newFolder: 'createNewFolder',
        rename: 'rename',
        delete: 'delete',
        upload: 'upload',
        download: 'download'
    };

    $(function () {
        uploadForm = $("#upload");
        uploadOutput = $("#output");

        loadRequest();

        $('#newFolder').click(callNewFolderHandler);

        uploadForm.submit(function (event) {
            uploadFileRequest();
            event.preventDefault();
        });

        // $('#test').click(
        //     function () {
        //         var test = getDirectoryByPath(storage, getCurrentPathString().replace(storage.name + '\\', ''));
        //         console.log(test);
        //     }
        // );
    });

    function uploadFileRequest(){
        var data = new FormData(uploadForm[0]);
        data.append("action", controllerActions.upload);
        data.append("path", getCurrentPathString());

        var req = new XMLHttpRequest();
        req.open("POST", "storage.php", true);
        req.responseType = "json";
        req.onload = function(oEvent) {
            if (req.status == 200) {
                var data = req.response;
                uploadFileResponseHandler(data);
            } else {
                uploadOutput.html("Error " + req.status + " occurred when trying to upload your file.<br \/>");
            }
        };
        req.send(data);
    }

    function uploadFileResponseHandler(data){
        if (data['executed'] === true) {
            var file = data["result"];
            file.parent = history.current();
            history.current().files.push(file);
            history.current().files.sort(function (file1, file2) {
                return (file1.name > file2.name) ? 1 : ((file2.name > file1.name) ? -1 : 0);
            });
            openDirectory(history.current());
        }
        else {
            alert(data['result']);
        }
    }

    function callNewFolderHandler() {
        var dialog = new ModalDialog();
        var settings = {
            header: "New folder",
            label: "Name:",
            OKText: "Create",
            OKHandler: createNewFolderRequest
        };
        dialog.renderModalDialog(settings);
    }

    function createNewFolderRequest(newFolderName) {
        var newFolderParentPath = getCurrentPathString();
        var requestData = {
            newFolderName: newFolderName,
            newFolderParentPath: newFolderParentPath
        };

        $.ajax({
            type: "POST",
            url: "storage.php",
            dataType: "JSON",
            data: JSON.stringify({
                action: controllerActions.newFolder,
                data: requestData
            })
        }).always(createNewFolderResponseHandler);
    }

    function createNewFolderResponseHandler(data) {
        if (data['executed'] === true) {
            var createdFolder = data['result'];
            createdFolder.parent = history.current();
            history.current().subDirs.push(createdFolder);
            history.current().subDirs.sort(function (dir1, dir2) {
                return (dir1.name > dir2.name) ? 1 : ((dir2.name > dir1.name) ? -1 : 0);
            });
            openDirectory(history.current());
        }
        else {
            alert(data['result']);
        }
    }

    function callContextMenuHandler(item, caller) {
        var options = [];

        options.push({
            name: controllerActions.rename,
            handler: renameItem.bind(null, item)
        });

        options.push({
            name: controllerActions.delete,
            handler: deleteItem.bind(null, item)
        });

        if(isFile(item)){
            options.push({
                name: controllerActions.download,
                handler: downloadFile.bind(null, item)
            });
        }

        menu.renderContextMenu(options, caller);
    }

    function renameItem(item) {
        function renameItemRequest(itemNewName) {
            var itemParentPath = getCurrentPathString();
            var requestData = {
                oldName: item.name,
                newName: itemNewName,
                parentPath: itemParentPath
            };

            $.ajax({
                type: "POST",
                url: "storage.php",
                dataType: "JSON",
                data: JSON.stringify({
                    action: controllerActions.rename,
                    data: requestData
                }),
            }).always(renameItemResponseHandler);
        }

        function renameItemResponseHandler(data) {
            if (data['executed'] === true) {
                item.name = data['result'].name;
                item.dateModified = data['result'].dateModified;
                history.current().subDirs.sort(function (dir1, dir2) {
                    return (dir1.name > dir2.name) ? 1 : ((dir2.name > dir1.name) ? -1 : 0);
                });
                history.current().files.sort(function (file1, file2) {
                    return (file1.name > file2.name) ? 1 : ((file2.name > file1.name) ? -1 : 0);
                });
                openDirectory(history.current());
            }
            else {
                alert(data['result']);
            }
        }

        var dialog = new ModalDialog();
        var settings = {
            header: "Rename item",
            label: "New name:",
            input: item.name,
            OKText: "Rename",
            OKHandler: renameItemRequest
        };
        dialog.renderModalDialog(settings);
    }


    function deleteItem(item) {
        function deleteItemRequest(item) {
            var itemParentPath = getCurrentPathString();
            var requestData = {
                name: item.name,
                parentPath: itemParentPath
            };

            $.ajax({
                type: "POST",
                url: "storage.php",
                dataType: "JSON",
                data: JSON.stringify({
                    action: controllerActions.delete,
                    data: requestData
                }),
            }).always(deleteItemResponseHandler);
        }

        function deleteItemResponseHandler(data) {
            if (data['executed'] === true) {
                if (isFile(item)) {
                    let filesCount = history.current().files.length;
                    for (let i = 0; i < filesCount; i++) {
                        if (history.current().files[i] === item) {
                            history.current().files.splice(i, 1);
                        }
                    }
                    history.current().files.sort(function (file1, file2) {
                        return (file1.name > file2.name) ? 1 : ((file2.name > file1.name) ? -1 : 0);
                    });
                }
                else {
                    let subDirsCount = history.current().subDirs.length;
                    for (let i = 0; i < subDirsCount; i++) {
                        if (history.current().subDirs[i] === item) {
                            history.current().subDirs.splice(i, 1);
                            break;
                        }
                    }
                    history.current().subDirs.sort(function (dir1, dir2) {
                        return (dir1.name > dir2.name) ? 1 : ((dir2.name > dir1.name) ? -1 : 0);
                    });
                    history.remove(item);
                }
                openDirectory(history.current());
            }
            else {
                alert(data['result']);
            }
        }

        deleteItemRequest(item);
    }

    function downloadFile(file){
        window.location = 'download.php?path=' + getCurrentPathString() + "&name=" + file.name;
    }

    function loadRequest() {
        $.ajax({
            type: "POST",
            url: "storage.php",
            dataType: "JSON",
            data: JSON.stringify({action: controllerActions.load}),
            success: loadResponseHandler
        });
    }

    function loadResponseHandler(data) {
        storage = data;
        storage.parent = null;
        prepareDirectory(storage);

        history.pushNew(storage);
        openDirectory(storage);

        $('#up').click(goUp);
        $('#back').click(goBack);
        $('#forward').click(goForward);
    }

    function prepareDirectory(directory) {
        for (let i = 0, l = directory.subDirs.length; i < l; i++) {
            var subDir = directory.subDirs[i];
            subDir.parent = directory;
            prepareDirectory(subDir);
        }

        for (let i = 0, l = directory.files.length; i < l; i++) {
            var file = directory.files[i];
            file.parent = directory;
        }
        return directory;
    }

    function openDirectory(directory) {

        $('#content').empty();

        for (let i = 0, l = directory.subDirs.length; i < l; i++) {
            var dir = directory.subDirs[i];
            var iconDir = $("<span>").addClass("glyphicon glyphicon-folder-close");
            var dirName = $("<td>").append(iconDir).append(" " + dir.name);
            var dirDataModified = $("<td>", {text: dir.dateModified});
            var dirSize = $("<td>", {text: "-"});
            var dirRow = $("<tr>").append(dirName).append(dirDataModified).append(dirSize).appendTo('#content');

            dirRow.dblclick(function (dir) {
                history.pushNew(dir);
                openDirectory(dir);
            }.bind(null, dir));

            dirRow.bind('contextmenu', {dir: dir}, function (event) {
                let data = event.data;
                event.preventDefault();
                callContextMenuHandler(data.dir, $(this));
            });
        }

        for (let i = 0, l = directory.files.length; i < l; i++) {
            var file = directory.files[i];
            var iconFile = $("<span>").addClass("glyphicon glyphicon-file");
            var fileName = $("<td>").append(iconFile).append(" " + file.name);
            var fileDataModified = $("<td>", {text: file.dateModified});
            var fileSize = $("<td>", {text: file.size});
            var fileRow = $("<tr>").append(fileName).append(fileDataModified).append(fileSize).appendTo('#content');

            fileRow.bind('contextmenu', {file: file}, function (event) {
                let data = event.data;
                event.preventDefault();
                event.stopPropagation();
                callContextMenuHandler(data.file, $(this));
            });
        }

        $('#currentPath').val(getCurrentPathString());

        history.current().parent !== null ? $('#up').removeClass('disabled') : $('#up').addClass('disabled');
        history.hasPrev() ? $('#back').removeClass('disabled') : $('#back').addClass('disabled');
        history.hasNext() ? $('#forward').removeClass('disabled') : $('#forward').addClass('disabled');
    }

    function goBack() {
        var prevDir = history.back();
        if (prevDir !== null) {
            openDirectory(prevDir);
        }
    }

    function goUp() {
        var parentDir = history.current().parent;
        if (parentDir !== null) {
            history.pushNew(parentDir);
            openDirectory(parentDir);
        }
    }

    function goForward() {
        var nextDir = history.forward();
        if (nextDir !== null) {
            openDirectory(nextDir);
        }
    }

    function getCurrentPathString() {
        return getPathString(history.current());
    }

    function getPathString(dirOrFile) {
        var resultPath = dirOrFile.name;
        while (dirOrFile.parent !== null) {
            resultPath = dirOrFile.parent.name + '\\' + resultPath;
            dirOrFile = dirOrFile.parent;
        }
        return resultPath;
    }

    function getDirectoryByPath(container, path) {
        if (container === storage && path === storage.name) {
            return storage;
        }
        var pathArr = path.split('\\');
        var name = pathArr.shift();
        if (pathArr.length === 0) {
            return getSubDirectoryByName(container, name);
        }
        var subPath = pathArr.join('\\');
        var subContainer = getSubDirectoryByName(container, name);
        return getDirectoryByPath(subContainer, subPath);
    }

    function getSubDirectoryByName(directory, name) {
        for (let i = 0, l = directory.subDirs.length; i < l; i++) {
            if (directory.subDirs[i].name === name) {
                return directory.subDirs[i];
            }
        }
    }

    function isFile(item) {
        if (item.files === undefined)
            return true;
        return false;
    }
})();