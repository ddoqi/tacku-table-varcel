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

    //----------이미지 미리보기 해겨중-------
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

  // 기존 thumbNail 셋팅하는 것 ----------------
  // let originImgThumbNail = targetWholeData?.thumbnail;
  // console.log(originImgThumbNail);

  // 체인지 이벤트 발생시 실행되는 함수-----------------

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
    console.log("영화제목", targetTitle);
    console.log("음식명", foodTitle);
    console.log("재료명", ingredient);
    console.log("소요시간", selectCookTime);
    console.log("음식종류", foodCategory);
    console.log("게시물 공개여부", displayStatus);
    console.log("대표사진 url", thumbnail);
    console.log("텍스트 에디터 내용", editorText);
    console.log("uid", uid);
    // console.log(currentUser.displayName);

    //new가 아니고 해당 게시물의 uid를 기준으로 updateDoc을 해줘야지

    const newEditRecipe = {
      uid: storageCurrentUser?.uid,
      writerNickName: storageCurrentUser?.displayName, // auth.currentUser에 있는 id
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
        alert("영화 제목을 선택해주세요!");
        movieTitleRef.current?.focus();
        return false;
      }
      if (!foodTitle) {
        alert("음식명을 작성해주세요!");
        foodTitleRef.current?.focus();
        return false;
      }
      if (!ingredient) {
        alert("재료명을 작성해주세요!");
        // ingredientRef.current?
        ingredientRef.current?.focus();
        return false;
      }
      if (!selectCookTime) {
        alert("조리 시간을 작성해주세요!");
        cookTimeRef.current?.focus();
        return false;
      }
      if (!foodCategory) {
        alert("음식 종류를 선택해주세요!");
        foodCategoryRef.current?.focus();
        return false;
      }
      if (!thumbnail) {
        alert("대표 사진을 선택해주세요!");
        thumbnailRef.current?.focus();
        return false;
      }
      if (!displayStatus) {
        alert("게시물 공개여부를 선택해주세요!");
        displayStatusRef.current?.focus();
        return false;
      }
      alert("게시글 본문이 채워지지 않았어요 😥");
      return false;
    }

    //---------update하는 함수-------------------
    const docRef = doc(dbService, "recipe", postId);
    await updateDoc(docRef, {
      writerNickName: storageCurrentUser?.displayName, // auth.currentUser에 있는 id
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
    alert("게시물 수정이 완료되었습니다. 메인 홈으로 돌아갑니다.");
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
      alert("대표 이미지 업데이트 성공~!");
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
        <h3 className="text-4xl font-bold">레시피 수정하기</h3>
        <hr className="mt-[24px] h-px border-[1.5px] border-brand100"></hr>

        <form onSubmit={editPost} className="mt-[40px]">
          <div className="pb-7">
            <b className="text-[21px] font-semibold"> 애니메이션 제목 검색 </b>
            <input
              value={searchTitle}
              className="p-2 ml-[15px] w-[280px] h-[45px] border border-mono60 rounded-[2px] "
              ref={movieTitleRef}
              name="targetTitle"
              type="text"
              onChange={(event) => inputChangeSetFunc(event, setSeachTitle)}
              placeholder="새로운 영화제목을 검색하세요"
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
                    🎬 {searchTitle} 로 검색된 영화 선택 🎬
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
                레시피 제목
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
                음식 종류
              </div>
              <select
                className="p-2 ml-[115px] text-mono70 w-[280px] h-[40px] border border-mono60 rounded-[2px]"
                ref={foodCategoryRef}
                onChange={(event) => {
                  selectChangeSetFunc(event, setFoodCategory);
                }}
              >
                <option value="none"> 음식 종류 선택 </option>
                <option value="국&탕&찌개">국/탕/찌개</option>
                <option value="구이&볶음&찜">구이/볶음/찜</option>
                <option value="튀김류">튀김류</option>
                <option value="베이커리&디저트">베이커리/디저트</option>
                <option value="음료&주류">음료/주류</option>
                <option value="밥&도시락&면">밥/도시락/면</option>
                <option value="식단&건강관리">식단/건강관리</option>
              </select>
            </div>
            <div className="pb-[40px]">
              <b className="text-[21px] font-semibold "> 소요시간 </b>
              <select
                className="p-2 ml-[115px] text-mono70 w-[280px] h-[40px] border border-mono60 rounded-[2px]"
                ref={cookTimeRef}
                onChange={(event) => {
                  selectChangeSetFunc(event, setSelectCookTime);
                }}
              >
                <option value="none"> 요리 소요 시간 선택 </option>
                <option value="15분이하">15분이하</option>
                <option value="30분이하">30분이하</option>
                <option value="1시간이하">1시간이하</option>
                <option value="1시간이상">1시간이상</option>
              </select>
            </div>
            <hr className="h-px my-7 border-[1px] border-mono60"></hr>
            <div className="flex items-stretch pt-7">
              <div className="text-[21px] font-semibold">주재료</div>
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
              레시피 작성
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
                    사진을 서버에 열심히 로딩하고 있어요 <br />
                    잠시만 기다려주세요 !!!!
                  </div>
                </div>
              </div>
            )}
            <div className="bg-mono40 h-[210px] mt-[40px]">
              <div className="mt-[12px] float-right flex items-stretch">
                <div className="mt-2 text-mono80 text-[16px]">대표 이미지</div>
                <label htmlFor="ex_file">
                  <div className="rounded-[2px] border border-mono60 ml-[20px] text-[16px] text-center pt-1 hover:cursor-pointer w-[100px] h-[35px] bg-mono40 text-mono100">
                    이미지 선택
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
                등록된 대표 이미지
              </div>
              <Image
                className="ml-[16px] w-[82px] h-[49px] pt-[16px]"
                loader={() => originImgThumbNail}
                src={originImgThumbNail}
                width={100}
                height={100}
                alt="기존 게시물 대표 섬네일 이미지입니다."
              />
              <div className="ml-[16px] pt-[28px] text-[16px] text-mono100">
                공개 설정
              </div>

              <div className="ml-[16px] flex items-stretch mt-[16px]">
                <div className="flex items-stretch">
                  <input
                    className="accent-brand100"
                    name="samename"
                    type="radio"
                    value="전체 공개"
                    onClick={(event) => {
                      const target = event.target as HTMLInputElement;
                      console.log("target.value", target.value);
                      setDisplayStatus(target.value);
                    }}
                  />

                  <h3 className="ml-2">전체 공개</h3>
                </div>
                <div className="flex items-stretch ml-[32px]">
                  <input
                    className="accent-brand100"
                    name="samename"
                    type="radio"
                    value="회원 공개"
                    onClick={(event) => {
                      const target = event.target as HTMLInputElement;
                      console.log("target.value", target.value);
                      setDisplayStatus(target.value);
                    }}
                  />
                  <h3 className="ml-2">멤버 공개</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-[40px] float-right">
            <button
              className="w-[180px] h-[48px] bg-brand100 border border-mono60"
              type="submit"
            >
              완료
            </button>
            <button
              onClick={() => {
                moveMainPage();
              }}
              type="button"
              className="ml-[12px] w-[180px] h-[48px] border border-mono60"
            >
              취소
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
