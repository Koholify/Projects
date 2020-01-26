using UnityEngine;
using UnityEngine.UI;

public class Instructions : MonoBehaviour
{
    public GameObject instr;

    void OnTriggerStay(Collider collider)
    {
        if (collider.tag == "Player")
            instr.SetActive(true);
    }

    void OnTriggerExit()
    {
        instr.SetActive(false);
    }
}
