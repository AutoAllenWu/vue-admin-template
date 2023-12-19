FROM dir.staff.xdf.cn/ai/qa/better-diff-web:origin
LABEL authors="wuxingwei"

COPY dist/ /neworiental/web/

ENTRYPOINT ["nginx", "-g","daemon off;"]
