# webAnalyst.js
A powerful tool for collecting data from browser ,analyze page speed,track user action and so on.


### Versions Status
* V 0.1.0:������(under development)

### architecture
below is the webAnalyst architecture:
![webAnalyst architecture](design/arch.jpg)

### TODOs
* ��������ռ���ܵ����
    * ���API�������(ing)
        * _wa.push([trackerName,command,param1,param2,param3...])
    * ��������ռ���ʽ�����ͷ�ʽ�����(done)
    * ���User Case,Deploy Model���(done)
    
    
* ���������ռ��ͻ���
    * Trackerʵ��(ing)
        * һ��tracker���Լ������֣�����ִ�и���ָ��
        * ָ�����ͨ��tracker������ã�Ҳ����ͨ��ȫ���������_wa.push()����
        * ֧�ֶ�command���������ж���
    * built-in tracker��װ��
        * page tracker:����׷��ҳ��PV,UV,�������Ϣ���û�ip...��
        * event tracker:�����ṩ�Զ����¼�׷�ٹ���
        * performance tracker:���ڶ�ҳ�����ܽ��з���
            * �ⲿ��tracker��Ҫ�����û����Զ�����Դ���ܡ��Զ�������ҳ�����ܽ���׷��
            * ͨ����tracker���÷��ڲ�ͬ��λ��(�ű�����ʱ��¼ʱ��),�Լ�ָ����ͬ����Դ���ؿ�ʼ������ʱ�䣬��ʵ�ֶ��ƹ�������ܷ���
        * resource tracker:
            * ��Ҫ��ҳ��ֱ����������Դ���з���
    * Resource Timing API,Navigation Timing API�ķ�װ(ing)
        * �ṩutilѸ�ټ���resource timing�Ĺؼ�����
        * �ṩutilѸ�ټ�����û����ĵ�ҳ��ʱ����ص�����
    * �����ṩһЩ�ӿڣ��ܹ����Խӵ������ĸ�����
        * ��һЩ���ٶ���������ʱ�򣬶�������������������յ�����

* ���������ռ������(demo)
    * ����cookie��ʶΨһ�û�
    * ��������ϴ��ű�������ϴ���ַ���µ�ì������
    
    
* �������ݷ�����(demo)
    * ��ʵ��һЩ������Ŀ��
        * PV,UV��
        * ҳ�����ܷ���:
            * ����ʱ��
            * �û��ɲ���ʱ��
            * ����ʱ��
            * ������ʱ��
        * ��Դ�������ܷ���(֧���Զ���)
        * �Զ����¼�����
        * �û���Դ,ip,�������
        * �ͻ�������״������
        * ����������Լ����Է���
        * ...



### License
MIT