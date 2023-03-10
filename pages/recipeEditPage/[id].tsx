import { dbService } from "@/config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { searchMovieTitle } from "@/api/tmdb";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "@/config/firebase";
import EditorComponent from "@/components/write/TextEditor";
import { collection, addDoc } from "firebase/firestore";
import baseImg from "/public/images/test1.png";
import { authService } from "@/config/firebase";
import { isAbsolute } from "path";

interface TitleType {
  title: string;
}

const RecipeEditPage = ({
  targetWholeData,
  postId,
}: {
  targetWholeData: any;
  postId: string;
}) => {
  const [searchTitle, setSeachTitle] = useState(targetWholeData.animationTitle);
  const [titleArr, setTitleArr] = useState<TitleType[]>([]);
  const [targetTitle, setTargetTitle] = useState(
    targetWholeData.animationTitle
  );
  const [foodTitle, setFoodTitle] = useState(targetWholeData.foodTitle);
  const [ingredient, setIngredient] = useState(targetWholeData.ingredient);
  const [selectCookTime, setSelectCookTime] = useState(
    targetWholeData.cookingTime
  );
  const [foodCategory, setFoodCategory] = useState(
    targetWholeData.foodCategory
  );
  const [displayStatus, setDisplayStatus] = useState("");
  const [imagePreview, setImagePreview] = useState(targetWholeData.thumbnail);
  const [thumbnail, setThumbnail] = useState(targetWholeData.thumbnail);
  const [editorText, setEditorText] = useState(targetWholeData.content);
  const [uid, setUid] = useState("");
  const movieTitleRef = useRef<HTMLInputElement>(null);
  const foodTitleRef = useRef<HTMLInputElement>(null);
  const ingredientRef = useRef<HTMLInputElement>(null);
  const cookTimeRef = useRef<HTMLSelectElement>(null);
  const foodCategoryRef = useRef<HTMLSelectElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const displayStatusRef = useRef<HTMLSelectElement>(null);

  const [storageCurrentUser, setStorageCurrentUser]: any = useState({});
  const [originImgThumbNail, setOriginImgThumbNail] = useState("");

  const [imgLoading, setImgLoading] = useState("default");

  useEffect(() => {
    const user = sessionStorage.getItem("User") || "";
    const parseUser = JSON.parse(user);
    setStorageCurrentUser(parseUser);

    //----------????????? ???????????? ?????????-------
    setOriginImgThumbNail(targetWholeData?.thumbnail);
  }, []);
  // console.log("storageCurrentUser:", storageCurrentUser?.uid);
  // console.log("storageCurrentUser:", storageCurrentUser?.displayName);

  const { data, refetch } = useQuery(["tmdb"], () => {
    return searchMovieTitle(searchTitle);
  });

  useEffect(() => {
    if (searchTitle) {
      refetch();
    }
    setTitleArr([]);
  }, [refetch, searchTitle]);

  useEffect(() => {
    if (data) {
      setTitleArr(data.results);
    }
  }, [data]);

  // ?????? thumbNail ???????????? ??? ----------------
  // let originImgThumbNail = targetWholeData?.thumbnail;
  // console.log(originImgThumbNail);

  // ????????? ????????? ????????? ???????????? ??????-----------------

  const inputChangeSetFunc = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFunction: any
  ) => {
    setFunction(event.target.value);
  };

  const selectChangeSetFunc = (
    event: React.ChangeEvent<HTMLSelectElement>,
    setFunction: any
  ) => {
    console.log(event.target.value);
    setFunction(event.target.value);
  };

  const editPost = async (event: any) => {
    event.preventDefault();
    console.log("????????????", targetTitle);
    console.log("?????????", foodTitle);
    console.log("?????????", ingredient);
    console.log("????????????", selectCookTime);
    console.log("????????????", foodCategory);
    console.log("????????? ????????????", displayStatus);
    console.log("???????????? url", thumbnail);
    console.log("????????? ????????? ??????", editorText);
    console.log("uid", uid);
    // console.log(currentUser.displayName);

    //new??? ????????? ?????? ???????????? uid??? ???????????? updateDoc??? ????????????

    const newEditRecipe = {
      uid: storageCurrentUser?.uid,
      writerNickName: storageCurrentUser?.displayName, // auth.currentUser??? ?????? id
      animationTitle: targetTitle,
      foodTitle,
      ingredient,
      cookingTime: selectCookTime,
      foodCategory: foodCategory,
      displayStatus,
      thumbnail,
      createdAt: Date.now(),
      content: editorText,
      viewCount: 0,
      bookmarkCount: 0,
    };
    if (
      !targetTitle ||
      !foodTitle ||
      !ingredient ||
      !selectCookTime ||
      !foodCategory ||
      !displayStatus ||
      !thumbnail ||
      !editorText ||
      editorText === "<p><br></p>"
    ) {
      if (!targetTitle) {
        alert("?????? ????????? ??????????????????!");
        movieTitleRef.current?.focus();
        return false;
      }
      if (!foodTitle) {
        alert("???????????? ??????????????????!");
        foodTitleRef.current?.focus();
        return false;
      }
      if (!ingredient) {
        alert("???????????? ??????????????????!");
        // ingredientRef.current?
        ingredientRef.current?.focus();
        return false;
      }
      if (!selectCookTime) {
        alert("?????? ????????? ??????????????????!");
        cookTimeRef.current?.focus();
        return false;
      }
      if (!foodCategory) {
        alert("?????? ????????? ??????????????????!");
        foodCategoryRef.current?.focus();
        return false;
      }
      if (!thumbnail) {
        alert("?????? ????????? ??????????????????!");
        thumbnailRef.current?.focus();
        return false;
      }
      if (!displayStatus) {
        alert("????????? ??????????????? ??????????????????!");
        displayStatusRef.current?.focus();
        return false;
      }
      alert("????????? ????????? ???????????? ???????????? ????");
      return false;
    }

    //---------update?????? ??????-------------------
    const docRef = doc(dbService, "recipe", postId);
    await updateDoc(docRef, {
      writerNickName: storageCurrentUser?.displayName, // auth.currentUser??? ?????? id
      animationTitle: targetTitle,
      foodTitle,
      ingredient,
      cookingTime: selectCookTime,
      foodCategory: foodCategory,
      displayStatus,
      thumbnail,
      createdAt: Date.now(),
      content: editorText,
    });

    //---------------------------------------
    console.log("newEditRecipe", newEditRecipe);
    alert("????????? ????????? ?????????????????????. ?????? ????????? ???????????????.");
    location.href = "/mainPage";
  };

  const onFileChange = (event: any) => {
    const theFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(theFile);
    reader.onloadend = (finishedEvent: any) => {
      const imgDataUrl: any = finishedEvent.currentTarget.result;
      localStorage.setItem("imgDataUrl", imgDataUrl);
      console.log("imgDataUrl", imgDataUrl);
      setImagePreview(imgDataUrl);
      setOriginImgThumbNail(imgDataUrl);
      addImageFirebase();
    };
  };

  const addImageFirebase = async () => {
    let randomID = Date.now();
    const imgRef = ref(storage, `newRecipeCoverPhoto${randomID}`);
    const imgDataUrl = localStorage.getItem("imgDataUrl");
    let downloadUrl: any;

    if (imgDataUrl) {
      console.log("imgDataUrl", imgDataUrl);
      setImgLoading("loading");
      const response = await uploadString(imgRef, imgDataUrl, "data_url");
      console.log("response:", response);

      downloadUrl = await getDownloadURL(response.ref);
      alert("?????? ????????? ???????????? ??????~!");
      await setImgLoading("loaded");

      console.log(downloadUrl);
      setThumbnail(downloadUrl);
    }
  };

  const moveMainPage = () => {
    location.href = "/mainPage";
  };

  return (
    <div className="bg-white p-10">
      <div className="mt-[75px] rounded-md p-7 container w-[1180px] mx-auto flex justify-center flex-col bg-white">
        <h3 className="text-4xl font-bold">????????? ????????????</h3>
        <hr className="mt-[24px] h-px border-[1.5px] border-brand100"></hr>

        <form onSubmit={editPost} className="mt-[40px]">
          <div className="pb-7">
            <b className="text-[21px] font-semibold"> ??????????????? ?????? ?????? </b>
            <input
              value={searchTitle}
              className="p-2 ml-[15px] w-[280px] h-[45px] border border-mono60 rounded-[2px] "
              ref={movieTitleRef}
              name="targetTitle"
              type="text"
              onChange={(event) => inputChangeSetFunc(event, setSeachTitle)}
              placeholder="????????? ??????????????? ???????????????"
            />

            {searchTitle ? (
              <div className="ml-[5px] rounded-lg w-[450px]  text-center mt-1">
                <select
                  className="ml-[185px] w-[280px] h-[40px] mt-[16px] border border-mono60 rounded-[2px] text-center"
                  onChange={(event) => {
                    selectChangeSetFunc(event, setTargetTitle);
                  }}
                >
                  <option
                    value="defaultValue"
                    selected
                    style={{ display: "none" }}
                  >
                    ???? {searchTitle} ??? ????????? ?????? ?????? ????
                  </option>
                  {titleArr?.map((item, index) => (
                    <option value={item.title} key={index}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div className="space-y-3 mt-[20px]">
            <div className="pb-7">
              <div className="text-[21px] float-left font-semibold">
                ????????? ??????
              </div>
              <input
                className="p-2 lg:w-[580px] sm:w-[280px] md:w-[280px] ml-[97px] text-mono70 h-[45px] border border-mono60 rounded-[2px]"
                value={foodTitle}
                ref={foodTitleRef}
                name="footTitle"
                type="text"
                onChange={(event) => inputChangeSetFunc(event, setFoodTitle)}
              />
            </div>
            <div className="pb-[40px]">
              <div className="text-[21px] float-left font-semibold">
                ?????? ??????
              </div>
              <select
                className="p-2 ml-[115px] text-mono70 w-[280px] h-[40px] border border-mono60 rounded-[2px]"
                ref={foodCategoryRef}
                onChange={(event) => {
                  selectChangeSetFunc(event, setFoodCategory);
                }}
              >
                <option value="none"> ?????? ?????? ?????? </option>
                <option value="???&???&??????">???/???/??????</option>
                <option value="??????&??????&???">??????/??????/???</option>
                <option value="?????????">?????????</option>
                <option value="????????????&?????????">????????????/?????????</option>
                <option value="??????&??????">??????/??????</option>
                <option value="???&?????????&???">???/?????????/???</option>
                <option value="??????&????????????">??????/????????????</option>
              </select>
            </div>
            <div className="pb-[40px]">
              <b className="text-[21px] font-semibold "> ???????????? </b>
              <select
                className="p-2 ml-[115px] text-mono70 w-[280px] h-[40px] border border-mono60 rounded-[2px]"
                ref={cookTimeRef}
                onChange={(event) => {
                  selectChangeSetFunc(event, setSelectCookTime);
                }}
              >
                <option value="none"> ?????? ?????? ?????? ?????? </option>
                <option value="15?????????">15?????????</option>
                <option value="30?????????">30?????????</option>
                <option value="1????????????">1????????????</option>
                <option value="1????????????">1????????????</option>
              </select>
            </div>
            <hr className="h-px my-7 border-[1px] border-mono60"></hr>
            <div className="flex items-stretch pt-7">
              <div className="text-[21px] font-semibold">?????????</div>
              <input
                value={ingredient}
                type="text"
                ref={ingredientRef}
                name="ingredient"
                onChange={(event) => inputChangeSetFunc(event, setIngredient)}
                className="pb-[80px] p-2 ml-[135px] w-[580px] h-[117px] border border-mono60 rounded-[2px]"
              />
            </div>
          </div>
          <hr className="mt-[40px] border-[1px] border-mono60"></hr>
          <div className="pt-[40px] relative">
            <div className="text-[21px] pb-[40px] font-semibold">
              ????????? ??????
            </div>
            <div className="w-full h-[538px]">
              <EditorComponent
                editorText={editorText}
                setEditorText={setEditorText}
              />
            </div>
            {imgLoading == "loading" && (
              <div className="flex items-center justify-center">
                <div className="text-center absolute rounded-lg flex bg-brand100 w-[500px] h-[200px]">
                  <div className="text-xl text-white m-auto">
                    ????????? ????????? ????????? ???????????? ????????? <br />
                    ????????? ?????????????????? !!!!
                  </div>
                </div>
              </div>
            )}
            <div className="bg-mono40 h-[210px] mt-[40px]">
              <div className="mt-[12px] float-right flex items-stretch">
                <div className="mt-2 text-mono80 text-[16px]">?????? ?????????</div>
                <label htmlFor="ex_file">
                  <div className="rounded-[2px] border border-mono60 ml-[20px] text-[16px] text-center pt-1 hover:cursor-pointer w-[100px] h-[35px] bg-mono40 text-mono100">
                    ????????? ??????
                  </div>
                </label>
                <input
                  id="ex_file"
                  className="hidden"
                  ref={thumbnailRef}
                  name="thumbnail"
                  onChange={(event) => {
                    onFileChange(event);
                  }}
                  type="file"
                  accept="images/*"
                />
              </div>
              <div className="ml-[16px] pt-[20px] text-mono100 text-[16px]">
                ????????? ?????? ?????????
              </div>
              <Image
                className="ml-[16px] w-[82px] h-[49px] pt-[16px]"
                loader={() => originImgThumbNail}
                src={originImgThumbNail}
                width={100}
                height={100}
                alt="?????? ????????? ?????? ????????? ??????????????????."
              />
              <div className="ml-[16px] pt-[28px] text-[16px] text-mono100">
                ?????? ??????
              </div>

              <div className="ml-[16px] flex items-stretch mt-[16px]">
                <div className="flex items-stretch">
                  <input
                    className="accent-brand100"
                    name="samename"
                    type="radio"
                    value="?????? ??????"
                    onClick={(event) => {
                      const target = event.target as HTMLInputElement;
                      console.log("target.value", target.value);
                      setDisplayStatus(target.value);
                    }}
                  />

                  <h3 className="ml-2">?????? ??????</h3>
                </div>
                <div className="flex items-stretch ml-[32px]">
                  <input
                    className="accent-brand100"
                    name="samename"
                    type="radio"
                    value="?????? ??????"
                    onClick={(event) => {
                      const target = event.target as HTMLInputElement;
                      console.log("target.value", target.value);
                      setDisplayStatus(target.value);
                    }}
                  />
                  <h3 className="ml-2">?????? ??????</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[40px] float-right">
            <button
              className="w-[180px] h-[48px] bg-brand100 border border-mono60"
              type="submit"
            >
              ??????
            </button>
            <button
              onClick={() => {
                moveMainPage();
              }}
              type="button"
              className="ml-[12px] w-[180px] h-[48px] border border-mono60"
            >
              ??????
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeEditPage;

export const getServerSideProps: any = async (context: any) => {
  let targetWholeData;
  const { params } = context;
  const { id } = params;
  const postId = id;

  const snap = await getDoc(doc(dbService, "recipe", postId));

  if (snap.exists()) {
    targetWholeData = snap.data();
  } else {
    console.log("No such document");
  }

  targetWholeData = JSON.parse(JSON.stringify(targetWholeData));

  return { props: { targetWholeData, postId } };
};
