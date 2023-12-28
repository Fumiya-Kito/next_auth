"use client"

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { User } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";

import useProfileModal from "@/app/hooks/useProfileModal";
import Modal from "./Modal";
import Input from "../input/Input";
import ImageUpload from "../input/ImageUpload";
import axios from "axios";
import * as z from "zod";
import { resolve } from "path";

// ステップ定義
enum STEPS {
  CONTENT = 0,
  IMAGE = 1
}

// 入力の検証ルールを定義
const schema = z.object({
  name: z.string().min(2, { message: "2文字以上入力する必要があります" }),
  image: z.string().optional(),
});

type ProfileProps = {
  currentUser: User | null;
}

const ProfileModal: React.FC<ProfileProps> = ({ currentUser }) => {
  // フックコール
  const router = useRouter();
  const profileModal = useProfileModal();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CONTENT);

  // フォームの状態管理
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FieldValues>({
    // 入力値の検証
    resolver: zodResolver(schema)
  });

  // 画像の監視
  const image = watch('image');

  // 画像のカスタム値を設定
  const setCustomValue = (id: string, value: string) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // 初期値設定
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name,
        image: currentUser.image || '',
      });
    }
  }, [currentUser, reset]);


  // 戻る
  const onBack = () => {
    setStep((value) => value - 1);
  }
  // 次へ
  const onNext = () => {
    setStep((value) => value + 1);
  }

  // メインボタンラベルの設定
  const primaryLabel = useMemo(() => {
    if (step === STEPS.IMAGE) {
      return '編集';
    }
    return '次へ';
  }, [step])

  // サブボタンラベルの設定
  const secondaryLabel = useMemo(() => {
    if (step === STEPS.CONTENT) {
      return undefined;
    }
    return '戻る';
  }, [step])


  // 送信
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    // 最後のステップ以外は次へ
    if (step !== STEPS.IMAGE) {
      return onNext();
    }
    setLoading(true);
    try {
      // プロフィール編集
      const res = await axios.patch('/api/profile', data);

      if (res.status === 200) { 
        toast.success('プロフィールの変更をしました');
        setStep(STEPS.CONTENT); // ステップを最初に戻す
        profileModal.onClose();
        router.refresh();
      }
    } catch (err) {
      toast.error('エラーが発生しました' + err);
      return;
    } finally {
      setLoading(false);
    }
  }

    // モーダルの内容
  const getBodyContent = (): React.ReactElement => {
    //ステップが画像の場合、画像アップロードコンポーネント
    if (step === STEPS.IMAGE) {
      return (
        <div>
          <ImageUpload onChange={(value) => setCustomValue('image', value)} value={image} />
        </div>
      )
    }

    // 名前入力のフォーム
    return (
      <div>
        <Input 
          id="name"
          label="名前"
          type="text"
          disabled={loading}
          register={register}
          errors={errors}
          required
        />
      </div>
    )
  }

  // 共通のモーダルコンポーネント
  return (
    <Modal 
      disabled={loading}
      isOpen={profileModal.isOpen}
      title="プロフィール"
      primaryLabel={primaryLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryLabel={secondaryLabel}
      secondaryAction={step === STEPS.CONTENT ? undefined : onBack}
      onClose={() => {
        profileModal.onClose();
        setStep(STEPS.CONTENT);
      }}
      body={getBodyContent()}
    />
  )
}

export default ProfileModal;

