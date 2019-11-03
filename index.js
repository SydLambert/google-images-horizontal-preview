/*
    Add option to remove related searches
    
    Element names deobfuscated
    .rg_bx             - Image wrapper (.rg_bx.rg_di.rg_el.ivg-i)
    img.rg_ic.rg_i     - Individual image
    .rg_bx .rg_l       - Image anchor
    #rg                - Image grid wrapper
    #irc_bg            - Vertical preview panel
    #irc_cc            - Vertical preview content
    .irc-s             - Selected image

    Elements within an enabled immersion container
    .irc_mi            - Large preview image
    .irc_mic           - Leage preview image inner wrapper
    .irc_t             - Large preview image wrapper
    #irc_ccbc          - Close button
    .irc_rimask        - Suggested image

    Horizontal addon-specific elements
    #horizontalPreview - Horizontal preview panel
    #horizontalClose   - Preview panel second close button
*/

(async ()=>{
    console.log("Loading Google Images Horizontal Preview...");
    let style=document.createElement("style");
    style.appendChild(document.createTextNode(`
        #irc_bg{ /* Vertical preview panel */
            display: block;
        }

        .irc_hol{ /* Source button in image description */
            flex-grow: 0 !important;
        }

        #irc_ccbc{ /* Close button */
            
        }

        .irc_rimask:nth-child(1n+2){ /* Removes excess suggested images */
            display: none;
        }

        #horizontalPreview{
            width: calc(100% + 20px);
            transform: translateX(-20px);
            background-color: red;
            animation: fadein 1s;
        }

        #horizontalClose{
            width: 30px;
            height: 30px;
            background: url('https://sydlambert.com/projects/google-images-horizontal-preview/close.png');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            border-radius: 15px;
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 999;
            color: #eee;
            cursor: pointer;
        }

        @keyframes fadein {
            from {
                opacity: 0;
                max-height: 0px;
            }
            to {
                opacity: 1;
                max-height: 100vh;
            }
        }
    `));
    document.head.appendChild(style);

    const getImageWrappers=(element=null)=>
        [...(element||document).querySelectorAll(".rg_bx.rg_di.rg_el.ivg-i")];

    const getImages=()=>
        [...document.querySelectorAll("img.rg_ic.rg_i")];

    const getImageAnchors=()=>
        [...document.querySelectorAll(".rg_bx .rg_l")];

    const applyToImage=e=>{
       e.addEventListener("click", event=>{
            //Record information about the image grid before the panel opens. "e" refers to the image wrapper.
            let currentRow=e.getAttribute("data-row");
            let currentRowElements=[...document.querySelectorAll(`.rg_bx.rg_di.rg_el.ivg-i[data-row="${currentRow}"]`)];
            let lastInRow=currentRowElements.slice(-1)[0];
            let originalRows=getImageWrappers().map(e=>({
                elem:e,
                row:e.getAttribute("data-row")
            }));
            let originalScrollTop=document.body.parentNode.scrollTop;
            let originalStyles=[
                getImageWrappers(),
                getImages(),
                getImageAnchors()
            ].flat().map(e=>({
                elem:e,
                style:e.getAttribute("style")
            }));

            console.log(currentRow);
            console.log(lastInRow);

            //MutationObserver checks when the user's chosen image becomes "focused"
            let mutationObserver = new MutationObserver(mutations=>{
                if([...e.classList].includes("irc-s")){
                    mutationObserver.disconnect();
                    console.log("Panel opened.");
                    //Code after panel opens

                    //Restore the original row number for image wrappers
                    originalRows.forEach(originalRow=>{
                        originalRow.elem.setAttribute("data-row", originalRow.row);
                    })

                    //Restore styles of images in grid before the panel opened.
                    originalStyles.forEach(originalStyle=>{
                        originalStyle.elem.setAttribute("style", originalStyle.style);
                    })

                    //Add the element that will contain the horizontal panel.
                    let horizontalPreview=document.createElement("div");
                    horizontalPreview.setAttribute("id", "horizontalPreview");
                    //Insert the horizontal preview panel after the last image in the row.
                    lastInRow.parentNode.insertBefore(horizontalPreview, lastInRow.nextSibling);

                    //Move the vertical preview into the horizontal preview panel.
                    let verticalPreview=document.querySelector("#irc_bg");
                    let enabledContainer=[...document.querySelectorAll(".irc_c.i8187.immersive-container")].filter(e=>e.style.display!="none")[0];
                    let largeImageWrapper=enabledContainer.querySelector(".irc_t");
                    let largeImageInnerWrapper=largeImageWrapper.querySelector(".irc_mic");
                    let largeImage=largeImageInnerWrapper.querySelector(".irc_mi");
                    console.log(largeImageWrapper);
                    let imageDescription=enabledContainer.querySelector(".irc_mmc.irc_b.i8152");
                    [
                        [verticalPreview,`
                            width: 100%;
                            height: auto;
                            /*height: calc((24px * 2) + ${largeImageInnerWrapper.style.height});*/
                        `],
                        [document.querySelector("#irc_cc"),`
                            width: 100%;
                        `],
                        [enabledContainer,`
                            width: 100%;
                            position: static;
                        `],
                        [largeImageWrapper,`
                            float: left;
                        `],
                        [imageDescription,`
                            float: right;
                            width: calc(90% - ${largeImageInnerWrapper.style.width});
                        `],
                    ].forEach(e=>e[0].setAttribute("style",e[1]));

                    //Add second close button
                    if(!document.querySelector("#horizontalClose")){
                        let horizontalClose=document.createElement("div");
                        horizontalClose.setAttribute("id","horizontalClose");
                        horizontalClose.addEventListener("click",()=>{
                            document.querySelector("#irc_ccbc").click();
                        });

                        verticalPreview.appendChild(horizontalClose);
                    }

                    //Move vertical preview pane into horizontal preview pane
                    horizontalPreview.appendChild(verticalPreview);

                    //Restore the image grid to full width
                    document.querySelector("#rg").style.width="100%";

                    //Scroll to preview box
                    horizontalPreview.scrollIntoView();
                }
            });

            //Observe the user's chosen image
            mutationObserver.observe(e,{
                attributes: true
            });
        });
    };

    let appliedImages=[];

    getImageWrappers().forEach(e=>{
        applyToImage(e);
        appliedImages.push(e);
    });

    const observer=new MutationObserver((mutationList, observer)=>{
        mutationList.forEach(mutation=>{
            mutation.addedNodes.forEach(element=>{
                getImageWrappers(element).forEach(element=>{
                    if(!appliedImages.includes(element)){
                        applyToImage(element);
                    }
                });
            });
        });
    });

    observer.observe(document.querySelector("body"), {
        attributes:false,
        childList:true,
        subtree:false
    });

    console.log("Loaded Google Images Horizontal Preview.");
})();