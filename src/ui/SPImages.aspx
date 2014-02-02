<%--  --%>
<%@ Page language="C#" MasterPageFile="~masterurl/default.master" 
        Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=12.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" %>
<%@ Register 
        Tagprefix="SharePoint" 
        Namespace="Microsoft.SharePoint.WebControls" 
        Assembly="Microsoft.SharePoint, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register 
        Tagprefix="Utilities" 
        Namespace="Microsoft.SharePoint.Utilities" 
        Assembly="Microsoft.SharePoint, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Register 
        Tagprefix="WebPartPages" 
        Namespace="Microsoft.SharePoint.WebPartPages" 
        Assembly="Microsoft.SharePoint, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
    Sharepoint Images
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitleInTitleArea" runat="server">
    Sharepoint Images
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Sharepoint Images</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <style>
/* BUILD_INCLUDE('<%= buildRootDir %>src/css/main.css') */
    </style>
    
    <script type="text/javascript">
        document.write(
            '<script src="/' + 
            '/ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></' +
            'script>'
        );
    </script>
    
    <script type="text/javascript">
// BUILD_INCLUDE('<%= buildRootDir %>src/js/main.js')        
    </script>
    
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderSearchArea" runat="server">
    <SharePoint:DelegateControl runat="server" ControlId="SmallSearchInputBox" />
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderLeftActions" runat="server"></asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageDescription" runat="server"></asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderBodyRightMargin" runat="server"></asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageImage" runat="server"></asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderLeftNavBar" runat="server"></asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderNavSpacer" runat="server"></asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">

<div id="sp_main_cntr"></div>
<div id="sp_img_cntr"></div>
<script id="sp_2007_img_src" type="text/text">
// BUILD_INCLUDE('<%= buildRootDir %>src/data/sp2007.txt')
</script>
<script id="sp_2010_img_src" type="text/text">
// BUILD_INCLUDE('<%= buildRootDir %>src/data/sp2010.txt')
</script>
<script id="sp_2013_img_src" type="text/text">
// BUILD_INCLUDE('<%= buildRootDir %>src/data/sp2013.txt')
</script>
<script id="sp_img_msg_about" type="text/text">
<div style="margin: 1em .5em;font-size:1.2em;">
    <p>
    This tool allows you to browse the set of images that should be available with out-of-the-box SharePoint
    installations. This utility contains a static list of known available images for each SharePoint
    version and does not have direct access to the server location where they are stored. For that
    reason, this list is not considered to be a complete set. Additional images may be available
    on your farm that this tool will not display.        
    </p>
    <p>
    Select a SharePoint version and image types from the drop-downs at the bottom. 
    Browse images by paging forward or backwards. As you browse through the many pages of content,
    selected images can be remembered by clicking icon next to the image information (down below).        
    </p>

</div>
</script>
<div id="imginfo" style="display:none;">
    <div class="cntr float-cntr">
        
        <div id="sp_img_menu">
            <div>
                <a id="sp_img_bookmarks" class="sp-img-disabled" href="javascript:" title="Remembered Images">
                    <img src="/_layouts/images/LTIL.GIF"/>
                    <span id="sp_img_bookmark_count">0</span>
                </a>
                <span id="sp_img_choices">
                    <select id="sp_version">
                        <option value="">Select...</option>
                        <option value="2007">SP 2007</option>
                        <option value="2010">SP 2010</option>
                        <option value="2013">SP 2013</option>
                    </select>
                    <select id="img_types">
                        <option value="" selected="selected">Select...</option>
                        <option value="all" selected="selected">All</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </span>
                <span>
                    <span>Page </span>
                    <span id="sp_img_this_page"></span>
                    <span> of </span>
                    <span id="sp_img_total_pages"></span>
                </span>
                <a href="javascript:" id="sp_img_page_prev">
                    <img src="/_layouts/images/workflowstatus_RTLarrow.png"/>
                </a>
                <a href="javascript:" id="sp_img_page_next">
                    <img src="/_layouts/images/workflowstatus_LTRarrow.png"/>
                </a>
            </div>
            
        </div>
        <div id="sp_img_info_cntr" class="float-cntr" style="display:none;">
            <div id="sp_img_dimensions">
                <div>
                    <span>Width:</span> <span id="img_width"></span>
                </div>
                <div>
                    <span>Height:</span> <span id="img_height"></span>
                </div>
            </div>
            <div id="sp_img_src_data">
                <div>
                    <label>Source Path</label> <input name="imgsrc" value=""/>
                </div>
                <div>
                    <label>HTML img</label> <input name="imghtml" value="" />
                </div>
            </div>
            <div id="sp_img_remember_cntr">
                <a id="sp_img_remember" href="javascript:" title="Remember this Image">
                    <img src="/_layouts/images/ctoa32.png"/>
                </a>
            </div>
        </div>
        
    </div>
</div>

</asp:Content>
     